import { describe, it, expect } from 'vitest';
import { validateTopikItemPolymorphism } from '@/validators/topikItem/topikItem.validator';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/errors/app.error';

describe('TopikItem Validator Polymorphism', () => {
  it('should throw error if Materi does not exist for MATERI type', async () => {
    await expect(validateTopikItemPolymorphism('non-existent-id', 'MATERI'))
      .rejects.toThrow(AppError);
  });

  it('should throw error if Quiz does not exist for QUIZ type', async () => {
    await expect(validateTopikItemPolymorphism('non-existent-id', 'QUIZ'))
      .rejects.toThrow(AppError);
  });

  it('should pass if Materi exists for MATERI type', async () => {
    // Setup
    const tutor = await prisma.tutor.create({
      data: {
        fullName: 'Test Tutor',
        email: 'tutor@test.com',
        password: 'password',
        gender: 'male',
        pekerjaan: 'Teacher',
        whatsappNumber: '1234567890',
        lastEducation: 'Master',
        institution: 'Test University',
        prodi: 'Computer Science',
        cvPathUrl: 'http://example.com/cv.pdf',
      },
    });

    const modul = await prisma.modul.create({
      data: {
        moduleName: 'Test Modul',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        targetTime: 60,
        difficulty: 'Beginner',
        tutorId: tutor.id,
      },
    });

    const topik = await prisma.topik.create({
      data: {
        nama: 'Test Topik',
        modulId: modul.id,
      },
    });

    const materi = await prisma.materi.create({
      data: {
        tutorId: tutor.id,
        topikId: topik.id,
        judul: 'Test Materi',
        article: 'Test Article',
      },
    });

    await expect(validateTopikItemPolymorphism(materi.id, 'MATERI'))
      .resolves.not.toThrow();
  });

  it('should pass if Quiz exists for QUIZ type', async () => {
     // Setup
     const tutor = await prisma.tutor.create({
      data: {
        fullName: 'Test Tutor 2',
        email: 'tutor2@test.com',
        password: 'password',
        gender: 'female',
        pekerjaan: 'Professor',
        whatsappNumber: '0987654321',
        lastEducation: 'PhD',
        institution: 'Another University',
        prodi: 'Mathematics',
        cvPathUrl: 'http://example.com/cv2.pdf',
      },
    });

    const modul = await prisma.modul.create({
      data: {
        moduleName: 'Test Modul 2',
        subtitle: 'Test Subtitle 2',
        description: 'Test Description 2',
        targetTime: 120,
        difficulty: 'Advanced',
        tutorId: tutor.id,
      },
    });

    const topik = await prisma.topik.create({
      data: {
        nama: 'Test Topik 2',
        modulId: modul.id,
      },
    });

    const materi = await prisma.materi.create({
      data: {
        tutorId: tutor.id,
        topikId: topik.id,
        judul: 'Test Materi 2',
        article: 'Test Article 2',
      },
    });

    const quiz = await prisma.quiz.create({
      data: {
        topikId: topik.id,
        question: 'Test Question',
        correctAnswer: 'A',
      },
    });

    await expect(validateTopikItemPolymorphism(quiz.id, 'QUIZ'))
      .resolves.not.toThrow();
  });
});
