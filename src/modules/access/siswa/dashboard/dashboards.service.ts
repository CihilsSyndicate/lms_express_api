import { prisma } from '../../../../lib/prisma';

export class DashboardService {
  async getLatestProgress(siswa_id: string) {
    try {
      const latestProgress = await prisma.progress.findMany({
        where: { siswa_id },
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

  async getCertificateDataAndAccessibleModule(siswa_id: string) {
    try {
      const certificateData = await prisma.certificate.count({
        where: { siswa_id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      const accessibleModules = await prisma.modul.count({
        where: {
          progress: {
            some: {
              siswa_id,
              is_completed: true,
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

  async progressStatistics(siswa_id: string) {
    try {
      const totalModules = await prisma.modul.count();
      const completedModules = await prisma.progress.count({
        where: { siswa_id, is_completed: true },
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
