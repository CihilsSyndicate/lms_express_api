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

  try {
    return await prisma.rating.create({
      data: {
        siswaId,
        modulId,
        rating: payload.rating ?? 0,
        komentar: payload.komentar ?? null,
      },
    });
  } catch (err) {
    // P2002: unique violation (siswaId, modulId) — terjadi jika dua request
    // paralel lolos dari cek findFirst di atas.
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === 'P2002'
    ) {
      throw new Error('Anda sudah memberikan rating untuk modul ini.');
    }
    throw err;
  }
};
