import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '@/index';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

describe('Student Learning Flow E2E', () => {
  let studentToken: string;
  let studentId: string;
  let moduleId: string;
  let topikId: string;
  let materiId: string;
  let submateriId: string;
  let quizId: string;
  let kcId: string;

  beforeEach(async () => {
    // 1. Setup Tutor
    const tutor = await prisma.tutor.create({
      data: {
        fullName: 'E2E Tutor',
        email: 'e2e-tutor@test.com',
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

    // 2. Setup Student
    const student = await prisma.siswa.create({
      data: {
        nama_lengkap: 'E2E Student',
        email: 'student@test.com',
        password: 'password',
        jenjang: 'SMA',
        kelas_sekolah: '12',
      },
    });
    studentId = student.id;

    // 3. Generate Token
    const { accessToken } = generateToken({
      id: student.id,
      name: student.nama_lengkap,
      email: student.email,
      role: 'siswa',
    });
    studentToken = accessToken;

    // 4. Setup Content
    const modul = await prisma.modul.create({
      data: {
        moduleName: 'E2E Modul',
        subtitle: 'Subtitle',
        description: 'Desc',
        targetTime: 60,
        difficulty: 'Beginner',
        tutorId: tutor.id,
      },
    });
    moduleId = modul.id;

    const topik = await prisma.topik.create({
      data: {
        nama: 'E2E Topik',
        modulId: modul.id,
      },
    });
    topikId = topik.id;

    const kc = await prisma.knowledgeComponent.create({
      data: {
        modulId: modul.id,
        code: 'KC001',
        nama: 'E2E Skill',
      },
    });
    kcId = kc.id;

    const materi = await prisma.materi.create({
      data: {
        tutorId: tutor.id,
        topikId: topik.id,
        article: 'E2E Article',
      },
    });
    materiId = materi.id;

    const submateri = await prisma.submateri.create({
      data: {
        materiId: materi.id,
        judul: 'E2E Submateri',
        konten: 'Content',
      },
    });
    submateriId = submateri.id;

    const quiz = await prisma.quiz.create({
      data: {
        materiId: materi.id,
        question: 'E2E Question',
        correctAnswer: 'A',
      },
    });
    quizId = quiz.id;

    // 5. Assign Student to Module
    await prisma.progress.create({
      data: {
        siswaId: student.id,
        modulId: modul.id,
        progressPercentage: 0,
      },
    });
  });

  it('should complete a full learning cycle', async () => {
    // 1. Get module details
    const resModul = await request(app)
      .get(`/siswa/modul/${moduleId}`)
      .set('Cookie', [`token=${studentToken}`]);

    expect(resModul.status).toBe(200);
    expect(resModul.body.moduleName).toBe('E2E Modul');

    // 2. Mark submaterial as complete
    const resComplete = await request(app)
      .post(`/siswa/progress/submateri/${submateriId}/complete`)
      .set('Cookie', [`token=${studentToken}`]);

    expect(resComplete.status).toBe(200);

    // 3. Submit Quiz Answer (Correct)
    const resQuiz = await request(app)
      .post('/siswa/kuis/submit')
      .set('Cookie', [`token=${studentToken}`])
      .send({
        quizId: quizId,
        answer: 'A',
        knowledgeComponentId: kcId,
      });

    expect(resQuiz.status).toBe(200);
    expect(resQuiz.body.isCorrect).toBe(true);

    // 4. Verify BKT State Update in DB
    const state = await prisma.studentKnowledgeState.findUnique({
      where: {
        siswaId_modulId_knowledgeComponentId: {
          siswaId: studentId,
          modulId: moduleId,
          knowledgeComponentId: kcId,
        },
      },
    });

    expect(state).not.toBeNull();
    // Initial was 0.2 (p_init). After correct answer (p_learn=0.3, p_slip=0.1, p_guess=0.1):
    // Numerator = 0.2 * 0.9 = 0.18
    // Denominator = 0.18 + 0.8 * 0.1 = 0.18 + 0.08 = 0.26
    // P(L|corr) = 0.18 / 0.26 = 0.6923
    // P(L)_new = 0.3 + 0.7 * 0.6923 = 0.3 + 0.4846 = 0.7846
    expect(state?.p_mastery_current).toBeCloseTo(0.7846, 4);

    // 5. Verify Answer Log
    const log = await prisma.studentAnswerLog.findFirst({
      where: {
        siswaId: studentId,
        questionId: quizId,
        questionSource: 'QUIZ',
      },
    });
    expect(log).not.toBeNull();
    expect(log?.isCorrect).toBe(true);
  });
});
