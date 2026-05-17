import { prisma } from '@/lib/prisma';

export const createModuleRating = async (
  modulId: string,
  siswaId: string,
  payload: { rating: number; komentar?: string },
) => {
  const modul = await prisma.modul.findUnique({
    where: { id: modulId },
  });

  if (!modul) {
    return null;
  }

  const existingRating = await prisma.rating.findFirst({
    where: {
      siswaId,
      modulId,
    },
  });

  if (existingRating) {
    throw new Error('Anda sudah memberikan rating untuk modul ini.');
  }

  return prisma.rating.create({
    data: {
      siswaId,
      modulId,
      rating: payload.rating ?? 0,
      komentar: payload.komentar ?? null,
    },
  });
};
