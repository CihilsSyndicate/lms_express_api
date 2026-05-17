import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import {
  createTopik,
  getTopikList,
  updateTopik,
  deleteTopik,
} from '@/utils/topik';

type TopikAction = 'create' | 'get' | 'update' | 'delete';

/**
 * Thin HTTP adapter for Admin's topic management operations.
 * Delegates business logic to @/utils/topik functions.
 * Handles req/res HTTP concerns only.
 */

export const createTopic = async (req: Request, res: Response) => {
  try {
    const payload = await createTopik(req.body, req.user?.id);

    return res.status(201).json(payload);
  } catch (error) {
    return handleTopikError(error, res, 'create');
  }
};

export const getTopicsByModule = async (req: Request, res: Response) => {
  try {
    const payload = await getTopikList(req.params.modulId as string);

    return res.status(200).json(payload);
  } catch (error) {
    return handleTopikError(error, res, 'get');
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const payload = await updateTopik(
      req.params.id as string,
      req.body,
      req.user?.id,
    );

    return res.status(200).json(payload);
  } catch (error) {
    return handleTopikError(error, res, 'update');
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const payload = await deleteTopik(req.params.id as string, req.user?.id);

    return res.status(200).json(payload);
  } catch (error) {
    return handleTopikError(error, res, 'delete');
  }
};

/**
 * Error handling helper for HTTP responses.
 */
function handleTopikError(error: unknown, res: Response, action: TopikAction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(getTopikLogMessage(action), error);

  return res.status(500).json({ message: getTopikInternalMessage(action) });
}

function getTopikLogMessage(action: TopikAction) {
  const messages: Record<TopikAction, string> = {
    create: '[TOPIK-ERROR] Gagal membuat topik:',
    get: '[TOPIK-ERROR] Gagal mengambil topik:',
    update: '[TOPIK-ERROR] Gagal update topik:',
    delete: '[TOPIK-ERROR] Gagal hapus topik:',
  };

  return messages[action];
}

function getTopikInternalMessage(action: TopikAction) {
  const messages: Record<TopikAction, string> = {
    create: 'Internal server error saat membuat topik.',
    get: 'Internal server error saat mengambil topik.',
    update: 'Internal server error saat update topik.',
    delete: 'Internal server error saat menghapus topik.',
  };

  return messages[action];
}
