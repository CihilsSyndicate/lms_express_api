import { Request, Response } from 'express';
import { getDashboardStatsService } from './dashboard.service';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const payload = await getDashboardStatsService();
    return res.status(200).json(payload);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
