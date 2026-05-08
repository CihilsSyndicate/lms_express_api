import { prisma } from '@/lib/prisma';
import { Request, Response } from 'express';

export const loadDashboardData = async (req: Request, res: Response) => {
  try {
    const tutorId = req.user?.id;

    const countPublishedModules = await prisma.modul.count({
      where: { tutor_id: tutorId as string, isDraft: false },
    });

    const getDraftModules = await prisma.modul.findMany({
      where: { tutor_id: tutorId as string, isDraft: true },
    });

    const countDraftModules = getDraftModules.length;

    const countRegisteredSiswa = await prisma.progress.count({
      where: {
        modul: {
          tutor_id: tutorId as string,
        },
      },
    });

    const countSiswaLulus = await prisma.progress.count({
      where: {
        modul: {
          tutor_id: tutorId as string,
        },
        is_lulus: true,
      },
    });

    const mostAccessedModules = await prisma.progress.groupBy({
      by: ['modul_id'],
      where: {
        modul: {
          tutor_id: tutorId as string,
        },
        NOT: {
          siswa_id: '',
        },
      },
      _count: {
        modul_id: true,
      },
      orderBy: {
        _count: {
          modul_id: 'desc',
        },
      },
      take: 5,
    });

    const nominatedModules = await prisma.modul.findMany({
      where: {
        tutor_id: tutorId as string,
        id: {
          in: mostAccessedModules.map((item) => item.modul_id),
        },
      },
      include: {
        progress: {
          select: {
            siswa_id: true,
          },
        },
        ratings: true,
      },
    });

    const getRatingsFromSiswa = await prisma.rating.findMany({
      where: {
        modul: {
          tutor_id: tutorId as string,
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
