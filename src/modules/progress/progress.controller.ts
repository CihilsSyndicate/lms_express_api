import { Request, Response } from 'express';
import { ProgressService } from './progress.service';

const progressService = new ProgressService();

export const getProgressByModule = async (req: Request, res: Response) => {
  try {
    const { modulId } = req.params;
    const siswaId = req.user?.id;

    if (req.user?.role !== 'siswa') {
      return res
        .status(403)
        .json({ message: 'Hanya siswa yang bisa melihat progress.' });
    }

    const progress = await progressService.getProgressByModule(
      siswaId as string,
      modulId as string,
    );

    if (!progress) {
      return res.status(404).json({ message: 'Progress tidak ditemukan.' });
    }

    res
      .status(200)
      .json({ message: 'Berhasil mengambil progress', data: progress });
  } catch (error) {
    console.error('[PROGRESS-ERROR] Gagal mengambil progress:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil progress.' });
  }
};

export const getAllProgressForSiswa = async (req: Request, res: Response) => {
  try {
    const siswaId = req.user?.id;

    if (req.user?.role !== 'siswa') {
      return res
        .status(403)
        .json({ message: 'Hanya siswa yang bisa melihat progress.' });
    }

    const progresses = await progressService.getAllProgressForSiswa(
      siswaId as string,
    );

    res
      .status(200)
      .json({ message: 'Berhasil mengambil semua progress', data: progresses });
  } catch (error) {
    console.error('[PROGRESS-ERROR] Gagal mengambil progress siswa:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil progress.' });
  }
};

export const markSubmateriCompleted = async (req: Request, res: Response) => {
  try {
    const { submateriId } = req.params;
    const siswaId = req.user?.id;

    if (req.user?.role !== 'siswa') {
      return res
        .status(403)
        .json({ message: 'Hanya siswa yang bisa update progress.' });
    }

    await progressService.markSubmateriCompleted(
      siswaId as string,
      submateriId as string,
    );

    res.status(200).json({ message: 'Submateri berhasil ditandai selesai' });
  } catch (error) {
    console.error('[PROGRESS-ERROR] Gagal update progress:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat update progress.' });
  }
};
