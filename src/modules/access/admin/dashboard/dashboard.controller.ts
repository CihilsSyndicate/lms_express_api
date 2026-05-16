import { prisma } from '@/lib/prisma';
import { Request, Response } from 'express';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const activeStudents = await prisma.siswa.count();

    const activeQuizzes = await prisma.quiz.count();

    const activeTutors = await prisma.tutor.count();

    const activeModules = await prisma.modul.count({
      where: {
        isDraft: false,
      },
    });

    const countAllUsers = activeStudents + activeTutors;

    res.json({
      activeStudents,
      activeQuizzes,
      activeTutors,
      activeModules,
      countAllUsers,
      activeClass: activeModules,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
