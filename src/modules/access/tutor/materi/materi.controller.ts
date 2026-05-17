import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import {
  createMateri,
  getMateriList,
  updateMateri,
  deleteMateri,
} from '@/utils/materi';

type MateriAction = 'create' | 'get' | 'update' | 'delete';

/**
 * Thin HTTP adapter for Materi (Material) operations.
 * Delegates business logic to @/utils/materi functions.
 * Handles req/res HTTP concerns only.
 */

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const payload = await createMateri(req.body, req.user?.id);

    return res.status(201).json(payload);
  } catch (error) {
    return handleMateriError(error, res, 'create');
  }
};

export const getMaterialsByModule = async (req: Request, res: Response) => {
  try {
    const payload = await getMateriList(req.params.modulId as string);

    return res.status(200).json(payload);
  } catch (error) {
    return handleMateriError(error, res, 'get');
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const payload = await updateMateri(
      req.params.id as string,
      req.body,
      req.user?.id,
    );

    return res.status(200).json(payload);
  } catch (error) {
    return handleMateriError(error, res, 'update');
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const payload = await deleteMateri(req.params.id as string, req.user?.id);

    return res.status(200).json(payload);
  } catch (error) {
    return handleMateriError(error, res, 'delete');
  }
};

/**
 * Error handling helper for HTTP responses.
 */
function handleMateriError(
  error: unknown,
  res: Response,
  action: MateriAction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(getMateriLogMessage(action), error);

  return res.status(500).json({ message: getMateriInternalMessage(action) });
}

function getMateriLogMessage(action: MateriAction) {
  const messages: Record<MateriAction, string> = {
    create: '[MATERI-ERROR] Gagal membuat materi:',
    get: '[MATERI-ERROR] Gagal mengambil materi:',
    update: '[MATERI-ERROR] Gagal update materi:',
    delete: '[MATERI-ERROR] Gagal hapus materi:',
  };

  return messages[action];
}

function getMateriInternalMessage(action: MateriAction) {
  const messages: Record<MateriAction, string> = {
    create: 'Internal server error saat membuat materi.',
    get: 'Internal server error saat mengambil materi.',
    update: 'Internal server error saat update materi.',
    delete: 'Internal server error saat menghapus materi.',
  };

  return messages[action];
}
