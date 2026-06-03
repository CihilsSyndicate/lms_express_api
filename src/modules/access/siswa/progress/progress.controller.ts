import { Request, Response } from 'express';
import * as progressService from './progress.service';
import { parsePaginationQuery } from '../../../../utils/pagination';

export const getProgressByModule = async (req: Request, res: Response) => {
  try {
    const { modulId } = req.params;
    const siswaId = req.user?.id;

    const progress = await progressService.getProgressByModuleService(
      siswaId as string,
      modulId as string,
    );

    if (!progress) {
      return res.status(404).json({ message: 'Progress tidak ditemukan.' });
    }
    // console.log(progress);
    res.status(200).json(progress);
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

    const { limit, cursor } = parsePaginationQuery(req.query);

    const progresses = await progressService.getAllProgressForSiswaService(
      siswaId as string,
      limit,
      cursor,
    );

    res.status(200).json(progresses);
  } catch (error: any) {
    console.error('[PROGRESS-ERROR] Gagal mengambil progress:', error);
    if (
      error.message === 'Invalid limit parameter' ||
      error.message === 'Invalid cursor'
    ) {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil progress.' });
  }
};

export const markSubmateriCompleted = async (req: Request, res: Response) => {
  try {
    const { submateriId } = req.params;
    const siswaId = req.user?.id;

    // console.log(submateriId, siswaId);

    const payload = await progressService.markSubmateriCompletedService(
      siswaId as string,
      submateriId as string,
    );

    res.status(200).json(payload);
  } catch (error: any) {
    console.error('[PROGRESS-ERROR] Gagal menandai selesai:', error);
    res.status(500).json({
      message: error.message || 'Internal server error saat menandai selesai.',
    });
  }
};
