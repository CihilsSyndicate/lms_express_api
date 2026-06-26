import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import {
  createPosttestRecord,
  addPosttestQuestion,
  getPosttestQuestions,
  getAllPosttest,
  getPosttestById,
  updatePosttestRecord,
  deletePosttestRecord,
  updatePosttestQuestion,
  deletePosttestQuestion,
  upsertPosttestSettings,
  deleteAllPosttestQuestions,
} from '@/utils/posttest';
import { parsePaginationQuery } from '@/utils/pagination';

type PosttestAction =
  | 'create'
  | 'addQuestion'
  | 'get'
  | 'getAll'
  | 'getById'
  | 'update'
  | 'delete'
  | 'updateSoal'
  | 'deleteSoal'
  | 'deleteAllSoal'
  | 'submit'
  | 'updateSettings';

/**
 * Thin HTTP adapter for Tutor's posttest management operations.
 * Delegates business logic to @/utils/posttest functions.
 * Handles req/res HTTP concerns only.
 * Note: Tutor can create posttest and add questions, but not submit.
 */

export const createPosttest = async (req: Request, res: Response) => {
  try {
    const payload = await createPosttestRecord(
      req.body.modul_id,
      req.user?.id,
    );

    return res.status(201).json(payload);
  } catch (error) {
    return handlePosttestError(error, res, 'create');
  }
};

export const addSoalPosttest = async (req: Request, res: Response) => {
  try {
    const payload = await addPosttestQuestion(req.body, req.user?.id);

    return res.status(201).json(payload);
  } catch (error) {
    return handlePosttestError(error, res, 'addQuestion');
  }
};

export const getPosttestByModul = async (req: Request, res: Response) => {
  try {
    const payload = await getPosttestQuestions(req.params.modulId as string);

    return res.status(200).json(payload);
  } catch (error) {
    return handlePosttestError(error, res, 'get');
  }
};

export const getAllTutorPosttest = async (req: Request, res: Response) => {
  try {
    const tutorId = req.user?.id;
    const { limit, cursor } = parsePaginationQuery(req.query);
    const payload = await getAllPosttest(tutorId as string, limit, cursor);
    return res.status(200).json(payload);
  } catch (error) {
    return handlePosttestError(error, res, 'getAll');
  }
};

export const getTutorPosttestById = async (req: Request, res: Response) => {
  try {
    const payload = await getPosttestById(
      req.params.posttestId as string,
      req.user?.id,
    );
    return res.status(200).json(payload);
  } catch (error) {
    return handlePosttestError(error, res, 'getById');
  }
};

export const updateTutorPosttest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = await updatePosttestRecord(
      id as string,
      req.body,
      req.user?.id,
    );
    return res.status(200).json(payload);
  } catch (error) {
    return handlePosttestError(error, res, 'update');
  }
};

export const deleteTutorPosttest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = await deletePosttestRecord(id as string, req.user?.id);
    return res.status(200).json(payload);
  } catch (error) {
    return handlePosttestError(error, res, 'delete');
  }
};

export const updateSoalPosttest = async (req: Request, res: Response) => {
  try {
    const { soalId } = req.params;
    const payload = await updatePosttestQuestion(
      soalId as string,
      req.body,
      req.user?.id,
    );
    return res.status(200).json(payload);
  } catch (error) {
    return handlePosttestError(error, res, 'updateSoal');
  }
};

export const deleteSoalPosttest = async (req: Request, res: Response) => {
  try {
    const { soalId } = req.params;
    const payload = await deletePosttestQuestion(
      soalId as string,
      req.user?.id,
    );
    return res.status(200).json(payload);
  } catch (error) {
    return handlePosttestError(error, res, 'deleteSoal');
  }
};

export const deleteAllPosttestSoal = async (req: Request, res: Response) => {
  try {
    const { posttestId } = req.params;
    await deleteAllPosttestQuestions(posttestId as string, req.user?.id);
    return res.status(200).json({ message: 'Semua soal posttest berhasil dihapus.' });
  } catch (error) {
    return handlePosttestError(error, res, 'deleteAllSoal');
  }
};

export const submitPosttest = async (req: Request, res: Response) => {
  return res.status(403).json({
    message: 'Tutor tidak memiliki akses untuk submit posttest.',
  });
};

export const updateTutorPosttestSettings = async (
  req: Request,
  res: Response,
) => {
  try {
    const { posttestId } = req.params;
    const payload = await upsertPosttestSettings(
      posttestId as string,
      req.body,
      req.user?.id,
    );
    return res.status(200).json(payload);
  } catch (error) {
    return handlePosttestError(error, res, 'updateSettings');
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

  console.error(getPosttestLogMessage(action), error);

  return res.status(500).json({ message: getPosttestInternalMessage(action) });
}

function getPosttestLogMessage(action: PosttestAction) {
  const messages: Record<PosttestAction, string> = {
    create: '[POSTTEST-ERROR] Gagal membuat posttest:',
    addQuestion: '[POSTTEST-ERROR] Gagal menambah soal posttest:',
    get: '[POSTTEST-ERROR] Gagal mengambil posttest:',
    getAll: '[POSTTEST-ERROR] Gagal mengambil daftar posttest:',
    getById: '[POSTTEST-ERROR] Gagal mengambil posttest by ID:',
    update: '[POSTTEST-ERROR] Gagal mengupdate posttest:',
    delete: '[POSTTEST-ERROR] Gagal menghapus posttest:',
    updateSoal: '[POSTTEST-ERROR] Gagal mengupdate soal posttest:',
    deleteSoal: '[POSTTEST-ERROR] Gagal menghapus soal posttest:',
    deleteAllSoal: '[POSTTEST-ERROR] Gagal menghapus semua soal posttest:',
    submit: '[POSTTEST-ERROR] Gagal submit posttest:',
    updateSettings: '[POSTTEST-ERROR] Gagal update pengaturan posttest:',
  };

  return messages[action];
}

function getPosttestInternalMessage(action: PosttestAction) {
  const messages: Record<PosttestAction, string> = {
    create: 'Internal server error saat membuat posttest.',
    addQuestion: 'Internal server error saat menambah soal.',
    get: 'Internal server error saat mengambil posttest.',
    getAll: 'Internal server error saat mengambil daftar posttest.',
    getById: 'Internal server error saat mengambil posttest by ID.',
    update: 'Internal server error saat mengupdate posttest.',
    delete: 'Internal server error saat menghapus posttest.',
    updateSoal: 'Internal server error saat mengupdate soal posttest.',
    deleteSoal: 'Internal server error saat menghapus soal posttest.',
    deleteAllSoal: 'Internal server error saat menghapus semua soal posttest.',
    submit: 'Internal server error saat submit posttest.',
    updateSettings: 'Internal server error saat update pengaturan posttest.',
  };

  return messages[action];
}
