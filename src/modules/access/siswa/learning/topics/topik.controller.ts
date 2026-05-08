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
 * Learning Module Wrapper - Topik Controller
 * Handles authorization and delegates to business logic.
 * Supports both siswa (read-only) and tutor (full access) operations.
 */

export const createTopic = async (req: Request, res: Response) => {
  try {
    const newTopic = await createTopik(req.body, req.user?.id);

    return res
      .status(201)
      .json({ message: 'Topik berhasil dibuat', data: newTopic });
  } catch (error) {
    return handleTopikError(error, res, 'create');
  }
};

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

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const updatedTopic = await updateTopik(
      req.params.id as string,
      req.body,
      req.user?.id,
    );

    return res
      .status(200)
      .json({ message: 'Topik berhasil diupdate', data: updatedTopic });
  } catch (error) {
    return handleTopikError(error, res, 'update');
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    await deleteTopik(req.params.id as string, req.user?.id);

    return res.status(200).json({ message: 'Topik berhasil dihapus' });
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
