import { Request, Response } from 'express';
import * as progressService from '../../siswa/progress/progress.service';

export const getUmumProgressByModule = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { modulId } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const progress = await progressService.getProgressByModuleService(
      userId,
      modulId as string,
    );

    if (!progress) {
      return res.status(404).json({ message: 'Progress tidak ditemukan.' });
    }

    return res.status(200).json(progress);
  } catch (error) {
    console.error('[UMUM-PROGRESS-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllUmumProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const progresses =
      await progressService.getAllProgressForSiswaService(userId);

    return res.status(200).json(progresses);
  } catch (error) {
    console.error('[UMUM-PROGRESS-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
