import { describe, it, expect } from 'vitest';
import { getOrderedTopikItems } from '@/utils/topikItem';
import { prisma } from '@/lib/prisma';

describe('Module Ordering & Polymorphic Retrieval', () => {
  it('should retrieve items in correct sequential order', async () => {
    // Setup
    const tutor = await prisma.tutor.create({
      data: {
        fullName: 'Order Tutor',
        email: 'order@test.com',
        password: 'password',
        gender: 'male',
        pekerjaan: 'Teacher',
        whatsappNumber: '1234567890',
        lastEducation: 'Master',
        institution: 'Order Univ',
        prodi: 'CS',
        cvPathUrl: 'http://example.com/cv.pdf',
      },
    });

    const modul = await prisma.modul.create({
      data: {
        moduleName: 'Order Modul',
        subtitle: 'Subtitle',
        description: 'Desc',
        targetTime: 60,
        difficulty: 'Beginner',
        tutorId: tutor.id,
      },
    });

    const topik = await prisma.topik.create({
      data: {
        nama: 'Order Topik',
        modulId: modul.id,
      },
    });

    const materi = await prisma.materi.create({
      data: {
        tutorId: tutor.id,
        topikId: topik.id,
        judul: 'Order Materi',
        article: 'Order Article',
      },
    });

    const quiz = await prisma.quiz.create({
      data: {
        topikId: topik.id,
        question: 'Order Quiz',
        correctAnswer: 'A',
      },
    });

    // Create TopikItems out of order
    await prisma.topikItem.create({
      data: {
        topikId: topik.id,
        itemId: quiz.id,
        itemType: 'QUIZ',
        orderNumber: 2,
      },
    });

    await prisma.topikItem.create({
      data: {
        topikId: topik.id,
        itemId: materi.id,
        itemType: 'MATERI',
        orderNumber: 1,
      },
    });

    const items = await getOrderedTopikItems(topik.id);

    expect(items).toHaveLength(2);
    expect(items[0]?.orderNumber).toBe(1);
    expect(items[0]?.itemType).toBe('MATERI');
    expect(items[0]?.data!.id).toBe(materi.id);
    
    expect(items[1]?.orderNumber).toBe(2);
    expect(items[1]?.itemType).toBe('QUIZ');
    expect(items[1]?.data!.id).toBe(quiz.id);
  });

  it('should return empty list if no items exist for a topic', async () => {
    const items = await getOrderedTopikItems('non-existent-topik');
    expect(items).toEqual([]);
  });
});
