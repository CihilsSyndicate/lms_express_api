import { prisma } from '@/lib/prisma';
import { Request, Response } from 'express';

export const loadDashboardData = async (req: Request, res: Response) => {
  try {
    const tutorId = req.user?.id;

    const countPublishedModules = await prisma.modul.count({
      where: { tutorId: tutorId as string, isDraft: false },
    });

    const getDraftModules = await prisma.modul.findMany({
      where: { tutorId: tutorId as string, isDraft: true },
    });

    const countDraftModules = getDraftModules.length;

    const countRegisteredSiswa = await prisma.progress.count({
      where: {
        modul: {
          tutorId: tutorId as string,
        },
      },
    });

    const countSiswaLulus = await prisma.progress.count({
      where: {
        modul: {
          tutorId: tutorId as string,
        },
        isGraduated: true,
      },
    });

    const mostAccessedModules = await prisma.progress.groupBy({
      by: ['modulId'],
      where: {
        modul: {
          tutorId: tutorId as string,
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
        tutorId: tutorId as string,
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
          tutorId: tutorId as string,
        },
      },
    });

    res.json({
      countPublishedModules,
      countDraftModules,
      countRegisteredSiswa,
      countSiswaLulus,
      nominatedModules,
      getDraftModules,
      getRatingsFromSiswa,
    });
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    res.status(500).json({ message: 'Gagal memuat data dashboard' });
  }
};
