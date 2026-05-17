import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import { getPosttestQuestions, submitPosttestAnswer } from '@/utils/posttest';

type PosttestAction = 'get' | 'submit';

/**
 * Thin HTTP adapter for Siswa's posttest operations.
 * Delegates business logic to @/utils/posttest functions.
 * Handles req/res HTTP concerns only.
 * Note: Siswa can read posttest questions and submit answers (no create/add questions).
 */

export const getPosttestByModul = async (req: Request, res: Response) => {
  try {
    const payload = await getPosttestQuestions(req.params.modulId as string);

    return res.status(200).json(payload);
  } catch (error) {
    return handlePosttestError(error, res, 'get');
  }
};

export const submitPosttest = async (req: Request, res: Response) => {
  try {
    const payload = await submitPosttestAnswer(
      req.params.modulId as string,
      req.body.answers,
      req.user?.id,
      req.user?.role,
    );

    return res.status(200).json(payload);
  } catch (error) {
    return handlePosttestError(error, res, 'submit');
  }
};

/**
 * Error handling helper for HTTP responses.
 */
function handlePosttestError(
  error: unknown,
  res: Response,
  action: PosttestAction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  const message =
    action === 'submit'
      ? '[POSTTEST-ERROR] Gagal submit posttest:'
      : '[POSTTEST-ERROR] Gagal mengambil posttest:';
  console.error(message, error);

  return res.status(500).json({ message: 'Internal server error.' });
}

// Aliases for backward compatibility if needed
export const createPosttest = async (req: Request, res: Response) => {
  return res
    .status(403)
    .json({ message: 'Siswa tidak memiliki akses untuk membuat posttest.' });
};

export const addSoalPosttest = async (req: Request, res: Response) => {
  return res.status(403).json({
    message: 'Siswa tidak memiliki akses untuk menambah soal posttest.',
  });
};
