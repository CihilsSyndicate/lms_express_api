import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/index';
import { prisma } from '@/lib/prisma';

describe('Umum Role E2E Business Flow', () => {
  let umumToken: string;
  let userId: string;
  let moduleId: string;
  let tutorId: string;

  beforeEach(async () => {
    // 1. Setup Tutor
    const tutor = await prisma.tutor.create({
      data: {
        fullName: 'Umum Tutor',
        email: 'umum-tutor@test.com',
        password: 'password',
        gender: 'male',
        pekerjaan: 'Teacher',
        whatsappNumber: '1234567890',
        lastEducation: 'Master',
        institution: 'Umum Univ',
        prodi: 'CS',
        cvPathUrl: 'http://example.com/cv.pdf',
      },
    });
    tutorId = tutor.id;

    // 2. Setup UMUM User (via registration)
    const registerRes = await request(app)
      .post('/auth/register')
      .send({
        nama_lengkap: 'Umum User',
        email: 'umum@test.com',
        password: 'password',
        jenjang: 'UMUM',
        kelas_sekolah: 'UMUM',
        role: 'umum',
      });
    expect(registerRes.status).toBe(201);
    userId = registerRes.body.id;

    // 3. Login as UMUM
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'umum@test.com', password: 'password' });
    umumToken = loginRes.header['set-cookie'][0].split(';')[0].split('=')[1];

    // 4. Create an UMUM Module (via Prisma directly to save time)
    const modul = await prisma.modul.create({
      data: {
        moduleName: 'General Module',
        subtitle: 'General Subtitle',
        description: 'General Desc',
        targetTime: 60,
        difficulty: 'Beginner',
        tutorId: tutorId,
        modulType: 'UMUM',
        isDraft: false,
      },
    });
    moduleId = modul.id;
  });

  it('should allow UMUM user to enroll and track progress', async () => {
    // 1. Fetch available modules for UMUM
    const resModules = await request(app)
      .get('/umum/modul')
      .set('Cookie', [`token=${umumToken}`]);
    
    expect(resModules.status).toBe(200);
    expect(resModules.body.items.some((m: any) => m.id === moduleId)).toBe(true);

    // 2. Enroll in UMUM Module
    const resEnroll = await request(app)
      .post(`/umum/modul/${moduleId}/enroll`)
      .set('Cookie', [`token=${umumToken}`]);
    
    expect(resEnroll.status).toBe(200);

    // 3. Check progress
    const resProgress = await request(app)
      .get(`/umum/progress/${moduleId}`)
      .set('Cookie', [`token=${umumToken}`]);
    
    expect(resProgress.status).toBe(200);
    expect(resProgress.body.modul.moduleName).toBe('General Module');

    // 4. Try to access SISWA route (RBAC Check)
    const resSiswaAccess = await request(app)
      .get('/siswa/modul')
      .set('Cookie', [`token=${umumToken}`]);
    
    expect(resSiswaAccess.status).toBe(403);
  });
});
