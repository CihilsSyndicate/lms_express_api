import { prisma } from '@/lib/prisma';

export const getDashboardStatsService = async () => {
  const activeUmumUser = await prisma.siswa.count({
    where: {
      isActive: true,
      studentType: 'UMUM',
    },
  });

  const activeSiswaUser = await prisma.siswa.count({
    where: {
      isActive: true,
      studentType: 'SISWA',
    },
  });

  const activeStudents = activeUmumUser + activeSiswaUser;

  const activeQuizzes = await prisma.quiz.count();
  const activeTutors = await prisma.tutor.count({
    where: {
      isActive: true,
    },
  });

  const activeModules = await prisma.modul.count({
    where: {
      isDraft: false,
    },
  });

  const countInactiveTutor = await prisma.tutor.count({
    where: {
      isActive: false,
    },
  });

  const countInactiveStudent = await prisma.siswa.count({
    where: {
      isActive: false,
    },
  });

  const totalUsers =
    activeStudents +
    activeTutors +
    countInactiveStudent +
    countInactiveTutor;

  const activeUsers = activeStudents + activeTutors;
  const inactiveUsers = countInactiveStudent + countInactiveTutor;

  const activeUserPercentage =
    totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

  const inactiveUserPercentage =
    totalUsers > 0 ? (inactiveUsers / totalUsers) * 100 : 0;

  return {
    activeStudents,
    activeQuizzes,
    activeTutors,
    activeModules,
    activeUserPercentage,
    inactiveUserPercentage,
    countAllUsers: totalUsers,
    activeClass: activeModules,
  };
};
