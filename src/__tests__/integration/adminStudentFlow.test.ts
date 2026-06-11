import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/index';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

describe('Admin & Student E2E Business Flow', () => {
  let adminToken: string;
  let studentToken: string;
  let studentId: string;
  let moduleId: string;
  let topikId: string;
  let materiId: string;
  let quizId: string;
  let tutorId: string;

  beforeEach(async () => {
    // 1. Setup Admin
    const adminPassword = await hashPassword('adminpass');
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@test.com',
        password: adminPassword,
        username: 'adminuser',
        fullName: 'Admin Name',
        gender: 'male',
        whatsappNumber: '123456789',
      },
    });

    // 2. Setup Student
    const studentPassword = await hashPassword('studentpass');
    const student = await prisma.siswa.create({
      data: {
        nama_lengkap: 'Student A',
        email: 'student-a@test.com',
        password: studentPassword,
        jenjang: 'SMA',
        kelas_sekolah: '12',
      },
    });
    studentId = student.id;

    // 3. Setup Tutor (for module creation)
    const tutor = await prisma.tutor.create({
      data: {
        fullName: 'Tutor E2E',
        email: 'tutor@test.com',
        password: 'password',
        gender: 'male',
        pekerjaan: 'Teacher',
        whatsappNumber: '1234567890',
        lastEducation: 'Master',
        institution: 'E2E Univ',
        prodi: 'CS',
        cvPathUrl: 'http://example.com/cv.pdf',
      },
    });
    tutorId = tutor.id;

    // 4. Admin Login
    const adminLoginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'adminpass' });
    adminToken = adminLoginRes.header['set-cookie'][0].split(';')[0].split('=')[1];

    // 5. Student Login
    const studentLoginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'student-a@test.com', password: 'studentpass' });
    studentToken = studentLoginRes.header['set-cookie'][0].split(';')[0].split('=')[1];
  });

  it('should execute the full Admin-Student business cycle', async () => {
    // 1. Admin creates a new Module (default: Draft state)
    const resModul = await request(app)
      .post('/admin/modul')
      .set('Cookie', [`token=${adminToken}`])
      .send({
        moduleName: 'E2E Business Module',
        subtitle: 'Subtitle',
        description: 'Comprehensive E2E Test',
        targetTime: 120,
        difficulty: 'Intermediate',
        tutorId: tutorId,
        isDraft: true,
      });
    
    expect(resModul.status).toBe(201);
    moduleId = resModul.body.id;
    expect(resModul.body.isDraft).toBe(true);

    // 2. Admin configures the Module pricing to 'Paid'
    const resUpdateModul = await request(app)
      .put(`/admin/modul/${moduleId}`)
      .set('Cookie', [`token=${adminToken}`])
      .send({
        isPaid: true,
        modulPrice: 50000,
        tutorId: tutorId,
      });
    
    expect(resUpdateModul.status).toBe(200);
    expect(resUpdateModul.body.isPaid).toBe(true);

    // 3. Admin creates a Topic
    const resTopic = await request(app)
      .post('/admin/topik')
      .set('Cookie', [`token=${adminToken}`])
      .send({
        modul_id: moduleId,
        nama: 'E2E Topic 1',
      });
    expect(resTopic.status).toBe(201);
    topikId = resTopic.body.id;

    // 4. Admin uploads Materials
    const resMateri = await request(app)
      .post('/admin/materi')
      .set('Cookie', [`token=${adminToken}`])
      .send({
        topik_id: topikId,
        judul: 'E2E Materi',
        article: 'E2E Comprehensive Article Content',
        is_video: false,
      });
    expect(resMateri.status).toBe(201);
    materiId = resMateri.body.id;

    // 5. Admin creates a Quiz with explicit Settings
    const quizPayload = {
      quiz: {
        topikId: topikId,
        question: 'What is E2E?',
        correctAnswer: 'End to End',
        skor: 10,
      },
      answerOptions: [
        { option: 'End to End' },
        { option: 'Easy to Eat' },
      ],
      setting: {
        timeLimit: 300,
        allowMultipleAttempts: false,
        minScoreTreshold: 80,
      },
    };

    const resQuiz = await request(app)
      .post('/admin/kuis')
      .set('Cookie', [`token=${adminToken}`])
      .send(quizPayload);
    
    expect(resQuiz.status).toBe(201);
    quizId = resQuiz.body.id;

    // 5.1 Admin creates a Knowledge Component
    const resKC = await prisma.knowledgeComponent.create({
      data: {
        modulId: moduleId,
        code: 'KC-E2E',
        nama: 'E2E Knowledge',
      },
    });
    const kcId = resKC.id;

    // 6. Admin changes Module state to 'Published'
    await request(app)
      .put(`/admin/modul/${moduleId}`)
      .set('Cookie', [`token=${adminToken}`])
      .send({ isDraft: false, tutorId: tutorId });

    // 7. Student A attempts to enroll in the 'Paid' module -> Assert Failure
    const resEnrollFail = await request(app)
      .post(`/siswa/modul/${moduleId}/enroll`)
      .set('Cookie', [`token=${studentToken}`]);
    
    expect(resEnrollFail.status).toBe(403);
    expect(resEnrollFail.body.message).toContain('Cannot enroll in a paid module');

    // 8. Admin updates Module pricing to 'Free'
    await request(app)
      .put(`/admin/modul/${moduleId}`)
      .set('Cookie', [`token=${adminToken}`])
      .send({ isPaid: false, tutorId: tutorId });

    // 9. Student A attempts to enroll again -> Assert Success
    const resEnrollSuccess = await request(app)
      .post(`/siswa/modul/${moduleId}/enroll`)
      .set('Cookie', [`token=${studentToken}`]);
    
    expect(resEnrollSuccess.status).toBe(200);

    // 10. Student A takes the quiz. System must enforce Quiz settings (max attempts).
    // Attempt 1
    const resSubmit1 = await request(app)
      .post('/siswa/kuis/submit')
      .set('Cookie', [`token=${studentToken}`])
      .send({
        quizId: quizId,
        answer: 'End to End',
        knowledgeComponentId: kcId,
      });
    expect(resSubmit1.status).toBe(200);

    // Attempt 2 -> Should fail due to allowMultipleAttempts: false
    const resSubmit2 = await request(app)
      .post('/siswa/kuis/submit')
      .set('Cookie', [`token=${studentToken}`])
      .send({
        quizId: quizId,
        answer: 'End to End',
        knowledgeComponentId: kcId,
      });
    
    expect(resSubmit2.status).toBe(400); 
    expect(resSubmit2.body.message).toContain('Multiple attempts are not allowed');

    // 11. Admin fetches student progress report
    const resProgress = await request(app)
      .get(`/admin/progress/${studentId}`)
      .set('Cookie', [`token=${adminToken}`]);
    
    expect(resProgress.status).toBe(200);
    // Assert that Student A's progress is visible and updated
    const studentProgress = resProgress.body.progress.find((p: any) => p.moduleName === 'E2E Business Module');
    expect(studentProgress).toBeDefined();
  });
});
