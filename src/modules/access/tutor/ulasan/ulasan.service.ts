import { prisma } from '@/lib/prisma';

export const listUlasanService = async (
  tutorId: string,
  cursor?: string,
  limit = 20,
) => {
  const ratings = await prisma.rating.findMany({
    where: {
      modul: {
        tutorId,
      },
    },
    include: {
      siswa: {
        select: {
          nama_lengkap: true,
          profileImage: true,
        },
      },
      modul: {
        select: {
          moduleName: true,
        },
      },
    },
    orderBy: { id: 'desc' },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = ratings.length > limit;
  const items = hasMore ? ratings.slice(0, limit) : ratings;
  const next_cursor = hasMore ? items[items.length - 1]!.id : null;

  return {
    items,
    next_cursor,
  };
};
