import { Request, Response } from 'express';
import { DashboardService } from './dashboards.service';

const dashboardService = new DashboardService();

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const { siswa_id } = req.params;
    const latestProgress = await dashboardService.getLatestProgress(
      siswa_id as string,
    );

    const { certificateData, accessibleModules } =
      await dashboardService.getCertificateDataAndAccessibleModule(
        siswa_id as string,
      );

    const data = {
      latestProgress,
      certificateData,
      accessibleModules,
      lastActivity: latestProgress.length > 0 ? latestProgress[0] : null,
    };

    res
      .json({ data, message: 'Dashboard data retrieved successfully' })
      .status(200);
  } catch (error) {
    console.error('[DASHBOARD-ERROR] Gagal mengambil data dashboard:', error);
    res.status(500).json({
      message: 'Internal server error saat mengambil data dashboard.',
    });
  }
};
