import { prisma } from '@/lib/prisma';
import { AppError } from '@/errors/app.error';

export async function validateTopikItemPolymorphism(itemId: string, itemType: 'ARTICLE' | 'QUIZ') {
  if (itemType === 'ARTICLE') {
    const materi = await prisma.materi.findUnique({
      where: { id: itemId },
    });
    if (!materi) {
      throw new AppError(400, `Materi with id ${itemId} does not exist.`);
    }
  } else if (itemType === 'QUIZ') {
    const quiz = await prisma.quiz.findUnique({
      where: { id: itemId },
    });
    if (!quiz) {
      throw new AppError(400, `Quiz with id ${itemId} does not exist.`);
    }
  } else {
    throw new AppError(400, `Invalid itemType: ${itemType}`);
  }
}
