import { Request, Response } from 'express';
import * as dashboardService from './dashboards.service';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const id = req?.user?.id as string;
    const payload = await dashboardService.getDashboardPayloadService(
      id as string,
    );

    res.status(200).json(payload);
  } catch (error) {
    console.error('[DASHBOARD-ERROR] Gagal mengambil data dashboard:', error);
    res.status(500).json({
      message: 'Internal server error saat mengambil data dashboard.',
    });
  }
};
