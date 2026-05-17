import { prisma } from '@/lib/prisma';

export const loadDashboardDataService = async (tutorId: string) => {
  const countPublishedModules = await prisma.modul.count({
    where: { tutorId, isDraft: false },
  });

  const getDraftModules = await prisma.modul.findMany({
    where: { tutorId, isDraft: true },
  });

  const countRegisteredSiswa = await prisma.progress.count({
    where: {
      modul: {
        tutorId,
      },
    },
  });

  const countSiswaLulus = await prisma.progress.count({
    where: {
      modul: {
        tutorId,
      },
      isGraduated: true,
    },
  });

  const mostAccessedModules = await prisma.progress.groupBy({
    by: ['modulId'],
    where: {
      modul: {
        tutorId,
      },
      NOT: {
        siswaId: '',
      },
    },
    _count: {
      modulId: true,
    },
    orderBy: {
      _count: {
        modulId: 'desc',
      },
    },
    take: 5,
  });

  const nominatedModules = await prisma.modul.findMany({
    where: {
      tutorId,
      id: {
        in: mostAccessedModules.map((item) => item.modulId),
      },
    },
    include: {
      progress: {
        select: {
          siswaId: true,
        },
      },
      ratings: true,
    },
  });

  const getRatingsFromSiswa = await prisma.rating.findMany({
    where: {
      modul: {
        tutorId,
      },
    },
  });

  return {
    countPublishedModules,
    countDraftModules: getDraftModules.length,
    countRegisteredSiswa,
    countSiswaLulus,
    nominatedModules,
    getDraftModules,
    getRatingsFromSiswa,
  };
};
