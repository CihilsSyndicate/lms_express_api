import { prisma } from '@/lib/prisma';

export const getDashboardStatsService = async () => {
  const activeStudents = await prisma.siswa.count();
  const activeQuizzes = await prisma.quiz.count();
  const activeTutors = await prisma.tutor.count();
  const activeModules = await prisma.modul.count({
    where: {
      isDraft: false,
    },
  });

  return {
    activeStudents,
    activeQuizzes,
    activeTutors,
    activeModules,
    countAllUsers: activeStudents + activeTutors,
    activeClass: activeModules,
  };
};
