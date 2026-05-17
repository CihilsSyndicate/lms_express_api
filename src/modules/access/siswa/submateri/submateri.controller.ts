import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import { getSubmateriList, getSubmateriById } from '@/utils/submateri';

type SubmateriAction = 'get';

/**
 * Thin HTTP adapter for Siswa's submaterial access operations.
 * Delegates business logic to @/utils/submateri functions.
 * Handles req/res HTTP concerns only.
 * Note: Siswa can only read submaterials (no create/update/delete).
 */

export const getSubmaterialsByMaterial = async (
  req: Request,
  res: Response,
) => {
  try {
    const payload = await getSubmateriList(req.params.materiId as string);

    return res.status(200).json(payload);
  } catch (error) {
    return handleSubmateriError(error, res, 'get');
  }
};

export const getSubmaterialDetail = async (req: Request, res: Response) => {
  try {
    const payload = await getSubmateriById(req.params.id as string);

    return res.status(200).json(payload);
  } catch (error) {
    return handleSubmateriError(error, res, 'get');
  }
};

/**
 * Error handling helper for HTTP responses.
 */
function handleSubmateriError(
  error: unknown,
  res: Response,
  action: SubmateriAction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error('[SUBMATERI-ERROR] Gagal mengambil submateri:', error);

  return res
    .status(500)
    .json({ message: 'Internal server error saat mengambil submateri.' });
}

// Aliases for backward compatibility if needed
export const createSubmaterial = async (req: Request, res: Response) => {
  return res
    .status(403)
    .json({ message: 'Siswa tidak memiliki akses untuk membuat submateri.' });
};

export const updateSubmaterial = async (req: Request, res: Response) => {
  return res
    .status(403)
    .json({ message: 'Siswa tidak memiliki akses untuk mengubah submateri.' });
};

export const deleteSubmaterial = async (req: Request, res: Response) => {
  return res
    .status(403)
    .json({ message: 'Siswa tidak memiliki akses untuk menghapus submateri.' });
};
