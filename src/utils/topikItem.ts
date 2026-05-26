import { prisma } from '@/lib/prisma';

export const getOrderedTopikItems = async (topikId: string) => {
  const items = await prisma.topikItem.findMany({
    where: { topikId },
    orderBy: { orderNumber: 'asc' },
  });

  // Polymorphic retrieval
  const detailedItems = await Promise.all(
    items.map(async (item) => {
      if (item.itemType === 'ARTICLE') {
        const materi = await prisma.materi.findUnique({
          where: { id: item.itemId },
          include: { submateris: true },
        });
        return { ...item, data: materi };
      } else if (item.itemType === 'QUIZ') {
        const quiz = await prisma.quiz.findUnique({
          where: { id: item.itemId },
          include: { quizSettings: true, quizAnswerOptions: true },
        });
        return { ...item, data: quiz };
      }
      return item;
    }),
  );

  return detailedItems;
};
