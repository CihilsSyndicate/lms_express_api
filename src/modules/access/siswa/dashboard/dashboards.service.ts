import { prisma } from '../../../../lib/prisma';

export class DashboardService {
  async getLatestProgress(siswaId: string) {
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
  }

  async getCertificateDataAndAccessibleModule(siswaId: string) {
    try {
      const certificateData = await prisma.certificate.count({
        where: { siswaId },
      });

      const accessibleModules = await prisma.modul.count({
        where: {
          progress: {
            some: {
              siswaId,
              status: 'COMPLETED',
            },
          },
        },
      });

      return { certificateData, accessibleModules };
    } catch (error) {
      console.error(
        '[DASHBOARD-SERVICE-ERROR] Gagal mengambil data sertifikat:',
        error,
      );
      throw new Error('Gagal mengambil data sertifikat');
    }
  }

  async progressStatistics(siswaId: string) {
    try {
      const totalModules = await prisma.modul.count();
      const completedModules = await prisma.progress.count({
        where: { siswaId, status: 'COMPLETED' },
      });
      const completionRate =
        totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

      return {
        totalModules,
        completedModules,
        completionRate,
      };
    } catch (error) {
      console.error(
        '[DASHBOARD-SERVICE-ERROR] Gagal menghitung statistik progress:',
        error,
      );
      throw new Error('Gagal menghitung statistik progress');
    }
  }
}
