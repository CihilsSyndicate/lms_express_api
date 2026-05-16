import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

export const ratingModul = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, komentar } = req.body;
    const siswaId = req.user?.id;

    const modul = await prisma.modul.findUnique({
      where: { id: id as string },
    });

    if (!modul)
      return res.status(404).json({ message: 'Modul tidak ditemukan.' });

    // Cek apakah siswa sudah pernah memberikan rating untuk modul ini
    const existingRating = await prisma.rating.findFirst({
      where: {
        siswaId: siswaId as string,
        modulId: id as string,
      },
    });

    if (existingRating) {
      // Update rating yang sudah ada
      res
        .status(403)
        .json({ message: 'Anda sudah memberikan rating untuk modul ini.' });
    }

    // Simpan rating baru
    const newRating = await prisma.rating.create({
      data: {
        siswaId: siswaId as string,
        modulId: id as string,
        rating,
        komentar,
      },
    });

    return res
      .json({ data: newRating, message: 'Rating berhasil diberikan.' })
      .status(201);
  } catch (err) {
    console.error('[MODUL-ERROR] Gagal memberikan rating:', err);
    res
      .status(500)
      .json({ message: 'Internal server error saat memberikan rating.' });
  }
};
