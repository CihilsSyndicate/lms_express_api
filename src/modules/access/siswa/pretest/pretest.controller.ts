import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import { getPretestQuestions, submitPretestAnswer } from '@/utils/pretest';

type PretestAction = 'get' | 'submit';

/**
 * Thin HTTP adapter for Siswa's pretest operations.
 * Delegates business logic to @/utils/pretest functions.
 * Handles req/res HTTP concerns only.
 * Note: Siswa can read pretest questions and submit answers (no create/add questions).
 */

export const getPretestByModul = async (req: Request, res: Response) => {
  try {
    const pretest = await getPretestQuestions(req.params.modulId as string);

    return res
      .status(200)
      .json({ message: 'Berhasil mengambil pretest', data: pretest });
  } catch (error) {
    return handlePretestError(error, res, 'get');
  }
};

export const submitPretest = async (req: Request, res: Response) => {
  try {
    const score = await submitPretestAnswer(
      req.params.modulId as string,
      req.body.answers,
      req.user?.id,
      req.user?.role,
    );

    return res
      .status(200)
      .json({ message: 'Pretest berhasil disubmit', score });
  } catch (error) {
    return handlePretestError(error, res, 'submit');
  }
};

/**
 * Error handling helper for HTTP responses.
 */
function handlePretestError(
  error: unknown,
  res: Response,
  action: PretestAction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  const message =
    action === 'submit'
      ? '[PRETEST-ERROR] Gagal submit pretest:'
      : '[PRETEST-ERROR] Gagal mengambil pretest:';
  console.error(message, error);

  return res.status(500).json({ message: 'Internal server error.' });
}

// Aliases for backward compatibility if needed
export const createPretest = async (req: Request, res: Response) => {
  return res
    .status(403)
    .json({ message: 'Siswa tidak memiliki akses untuk membuat pretest.' });
};

export const addSoalPretest = async (req: Request, res: Response) => {
  return res.status(403).json({
    message: 'Siswa tidak memiliki akses untuk menambah soal pretest.',
  });
};
