import { Request, Response } from 'express';
import {
  getAllStudentProgress as getProgressByModulesFunc,
  getProgressByStudentId as getProgressByStudentIdFunc,
  getModuleProgress as getModuleProgressFunc,
  analyzeComputationalThinking as analyzeComputationalThinkingFunc,
} from '@/utils/progress';
import { parsePaginationQuery } from '@/utils/pagination';

export const getStudentProgressByModules = async (
  req: Request,
  res: Response,
) => {
  try {
    const tutorId = req?.user?.id;

    if (!tutorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { limit, cursor } = parsePaginationQuery(req.query);

    const progressByModules = await getProgressByModulesFunc(
      tutorId,
      limit,
      cursor,
    );

    return res.status(200).json(progressByModules);
  } catch (err: any) {
    console.error('Error fetching student progress:', err);
    if (
      err.message === 'Invalid limit parameter' ||
      err.message === 'Invalid cursor'
    ) {
      return res.status(400).json({ message: err.message });
    }
    return res
      .status(500)
      .json({ message: 'Failed to fetch student progress' + err });
  }
};

export const getModuleStudentProgress = async (
  req: Request,
  res: Response,
) => {
  try {
    const tutorId = req?.user?.id;
    if (!tutorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { modulId } = req.params;
    const data = await getModuleProgressFunc(modulId as string, tutorId);

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Error fetching module student progress:', err);
    const status = err.statusCode || 500;
    return res
      .status(status)
      .json({ message: err.message || 'Gagal mengambil data progres siswa' });
  }
};

export const getProgressByStudentId = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const studentProgress = await getProgressByStudentIdFunc(
      studentId as string,
    );

    return res.status(200).json(studentProgress);
  } catch (err) {
    console.log('Error fetching student progress by ID:', err);
    return res
      .status(500)
      .json({ message: 'Failed to fetch student progress by ID' + err });
  }
};

export const analyzeComputationalThinking = async (
  req: Request,
  res: Response,
) => {
  try {
    const { studentId } = req.params;
    const modulId = req.query.modulId as string | undefined;
    const payload = await analyzeComputationalThinkingFunc(studentId as string, modulId);

    return res.status(200).json(payload);
  } catch (err) {
    console.error('Error fetching computational thinking progress:', err);
    return res.status(500).json({
      message: 'Failed to fetch computational thinking progress' + err,
    });
  }
};
