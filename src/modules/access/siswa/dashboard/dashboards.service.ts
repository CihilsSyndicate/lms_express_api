import { prisma } from '../../../../lib/prisma';

export const getLatestProgressService = async (siswaId: string) => {
  try {
    const latestProgress = await prisma.progress.findMany({
      where: { siswaId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    return latestProgress;
  } catch (error) {
    console.error(
      '[DASHBOARD-SERVICE-ERROR] Gagal mengambil data dashboard:',
      error,
    );
    throw new Error('Gagal mengambil data dashboard');
  }
};

export const getCertificateDataAndAccessibleModuleService = async (siswaId: string) => {
  try {
    const certificateData = await prisma.certificate.findMany({
      where: {
        siswaId: siswaId,
      },
    });

    const accessibleModules = await prisma.modul.findMany({
      where: {
        id: {
          in: (
            await prisma.progress.findMany({
              where: {
                siswaId: siswaId,
              },
              select: {
                modulId: true,
              },
            })
          ).map((p) => p.modulId),
        },
      },
    });

    return {
      certificateData,
      accessibleModules,
    };
  } catch (err) {
    console.error(
      '[DASHBOARD-SERVICE-ERROR] Gagal mengambil data dashboard:',
      err,
    );
    throw new Error('Gagal mengambil data dashboard' + err);
  }
};

export const getDashboardPayloadService = async (siswaId: string) => {
  const latestProgress = await getLatestProgressService(siswaId);
  const { certificateData, accessibleModules } =
    await getCertificateDataAndAccessibleModuleService(siswaId);

  return {
    latestProgress,
    certificateData,
    accessibleModules,
    lastActivity: latestProgress.length > 0 ? latestProgress[0] : null,
  };
};
