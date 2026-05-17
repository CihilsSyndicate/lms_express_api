import { Request, Response } from 'express';
import { createModuleRating } from '@/utils/rating';

export const ratingModul = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const siswaId = req.user?.id;

    const payload = await createModuleRating(
      id as string,
      siswaId as string,
      req.body,
    );
    if (!payload)
      return res.status(404).json({ message: 'Modul tidak ditemukan.' });

    return res.status(201).json(payload);
  } catch (err: any) {
    if (err.message === 'Anda sudah memberikan rating untuk modul ini.') {
      return res.status(403).json({ message: err.message });
    }
    console.error('[MODUL-ERROR] Gagal memberikan rating:', err);
    return res
      .status(500)
      .json({ message: 'Internal server error saat memberikan rating.' });
  }
};
