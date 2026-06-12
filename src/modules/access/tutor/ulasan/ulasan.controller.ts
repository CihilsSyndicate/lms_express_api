import { Request, Response } from 'express';
import { listUlasanService } from './ulasan.service';

export const listUlasan = async (req: Request, res: Response) => {
  try {
    const tutorId = req.user?.id as string;
    const cursor = req.query.cursor as string | undefined;
    const limit = Number(req.query.limit) || 20;

    const result = await listUlasanService(tutorId, cursor, limit);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching ulasan:', error);
    return res.status(500).json({ message: 'Gagal memuat ulasan' });
  }
};
