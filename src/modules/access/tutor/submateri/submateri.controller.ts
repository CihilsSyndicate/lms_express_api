import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import {
  createSubmateri,
  getSubmateriList,
  getSubmateriById,
  updateSubmateri,
  deleteSubmateri,
} from '@/utils/submateri';

type SubmateriAction = 'create' | 'get' | 'update' | 'delete';

/**
 * Thin HTTP adapter for Submateri (Submaterial) operations.
 * Delegates business logic to @/utils/submateri functions.
 * Handles req/res HTTP concerns only.
 */

export const createSubmaterial = async (req: Request, res: Response) => {
  try {
    const newSubmaterial = await createSubmateri(req.body, req.user?.id);

    return res
      .status(201)
      .json({ message: 'Submateri berhasil dibuat', data: newSubmaterial });
  } catch (error) {
    return handleSubmateriError(error, res, 'create');
  }
};

export const getSubmaterialsByMaterial = async (
  req: Request,
  res: Response,
) => {
  try {
    const submaterials = await getSubmateriList(req.params.materiId as string);

    return res.status(200).json({
      message: 'Berhasil mengambil data submateri',
      data: submaterials,
    });
  } catch (error) {
    return handleSubmateriError(error, res, 'get');
  }
};

export const getSubmaterialDetail = async (req: Request, res: Response) => {
  try {
    const submateri = await getSubmateriById(req.params.id as string);

    return res.status(200).json({
      message: 'Berhasil mengambil detail submateri',
      data: submateri,
    });
  } catch (error) {
    return handleSubmateriError(error, res, 'get');
  }
};

export const updateSubmaterial = async (req: Request, res: Response) => {
  try {
    const updatedSubmaterial = await updateSubmateri(
      req.params.id as string,
      req.body,
      req.user?.id,
    );

    return res.status(200).json({
      message: 'Submateri berhasil diupdate',
      data: updatedSubmaterial,
    });
  } catch (error) {
    return handleSubmateriError(error, res, 'update');
  }
};

export const deleteSubmaterial = async (req: Request, res: Response) => {
  try {
    await deleteSubmateri(req.params.id as string, req.user?.id);

    return res.status(200).json({ message: 'Submateri berhasil dihapus' });
  } catch (error) {
    return handleSubmateriError(error, res, 'delete');
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

  console.error(getSubmateriLogMessage(action), error);

  return res.status(500).json({ message: getSubmateriInternalMessage(action) });
}

function getSubmateriLogMessage(action: SubmateriAction) {
  const messages: Record<SubmateriAction, string> = {
    create: '[SUBMATERI-ERROR] Gagal membuat submateri:',
    get: '[SUBMATERI-ERROR] Gagal mengambil submateri:',
    update: '[SUBMATERI-ERROR] Gagal update submateri:',
    delete: '[SUBMATERI-ERROR] Gagal hapus submateri:',
  };

  return messages[action];
}

function getSubmateriInternalMessage(action: SubmateriAction) {
  const messages: Record<SubmateriAction, string> = {
    create: 'Internal server error saat membuat submateri.',
    get: 'Internal server error saat mengambil submateri.',
    update: 'Internal server error saat update submateri.',
    delete: 'Internal server error saat menghapus submateri.',
  };

  return messages[action];
}
