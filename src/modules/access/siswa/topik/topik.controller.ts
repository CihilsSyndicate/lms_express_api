import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import { getTopikList } from '@/utils/topik';

type TopikAction = 'get';

/**
 * Thin HTTP adapter for Siswa's topic access operations.
 * Delegates business logic to @/utils/topik functions.
 * Handles req/res HTTP concerns only.
 * Note: Siswa can only read topics (no create/update/delete).
 */

export const getTopicsByModule = async (req: Request, res: Response) => {
  try {
    const topics = await getTopikList(req.params.modulId as string);

    return res
      .status(200)
      .json({ message: 'Berhasil mengambil data topik', data: topics });
  } catch (error) {
    return handleTopikError(error, res, 'get');
  }
};

/**
 * Error handling helper for HTTP responses.
 */
function handleTopikError(error: unknown, res: Response, action: TopikAction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error('[TOPIK-ERROR] Gagal mengambil topik:', error);

  return res
    .status(500)
    .json({ message: 'Internal server error saat mengambil topik.' });
}

// Aliases for backward compatibility if needed
export const createTopic = async (req: Request, res: Response) => {
  const { method } = req;
  return res
    .status(403)
    .json({ message: 'Siswa tidak memiliki akses untuk membuat topik.' });
};

export const updateTopic = async (req: Request, res: Response) => {
  const { method } = req;
  return res
    .status(403)
    .json({ message: 'Siswa tidak memiliki akses untuk mengubah topik.' });
};

export const deleteTopic = async (req: Request, res: Response) => {
  const { method } = req;
  return res
    .status(403)
    .json({ message: 'Siswa tidak memiliki akses untuk menghapus topik.' });
};
