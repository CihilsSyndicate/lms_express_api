import { Request, Response } from 'express';
import { loadDashboardDataService } from './dashboard.service';

export const loadDashboardData = async (req: Request, res: Response) => {
  try {
    const tutorId = req.user?.id;

    const payload = await loadDashboardDataService(tutorId as string);

    return res.status(200).json(payload);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return res.status(500).json({ message: 'Gagal memuat data dashboard' });
  }
};
