import { Request, Response } from 'express';
import {
  getAllStudentProgress as getProgressByModulesFunc,
  getProgressByStudentId as getProgressByStudentIdFunc,
  analyzeComputationalThinking as analyzeComputationalThinkingFunc,
} from '@/utils/progress';
import { parsePaginationQuery } from '@/utils/pagination';

export const getStudentProgressByModules = async (
  req: Request,
  res: Response,
) => {
  try {
    const { limit, cursor } = parsePaginationQuery(req.body);

    const progressByModules = await getProgressByModulesFunc(
      undefined,
      Number(limit),
      cursor,
    );
    return res.status(200).json(progressByModules);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: 'Failed to fetch student progress' + err.message });
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
    res
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
    const payload = await analyzeComputationalThinkingFunc(studentId as string);

    return res.status(200).json(payload);
  } catch (err) {
    console.error('Error fetching computational thinking progress:', err);
    res.status(500).json({
      message: 'Failed to fetch computational thinking progress' + err,
    });
  }
};
