import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import {
  createPretestRecord,
  addPretestQuestion,
  getPretestQuestions,
  getAllPretest,
  getPretestById,
  updatePretestRecord,
  deletePretestRecord,
  updatePretestQuestion,
  deletePretestQuestion,
  upsertPretestSettings,
  deleteAllPretestQuestions,
} from '@/utils/pretest';
import { parsePaginationQuery } from '@/utils/pagination';

type PretestAction =
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
  | 'updateSettings'
  | 'submit';

/**
 * Thin HTTP adapter for Tutor's pretest management operations.
 * Delegates business logic to @/utils/pretest functions.
 * Handles req/res HTTP concerns only.
 * Note: Tutor can create pretest and add questions, but not submit.
 */

export const createPretest = async (req: Request, res: Response) => {
  try {
    const payload = await createPretestRecord(
      req.body.modul_id,
      req.user?.id,
      req.body.pretestSettings,
    );

    return res.status(201).json(payload);
  } catch (error) {
    return handlePretestError(error, res, 'create');
  }
};

export const addSoalPretest = async (req: Request, res: Response) => {
  try {
    const payload = await addPretestQuestion(req.body, req.user?.id);

    return res.status(201).json(payload);
  } catch (error) {
    return handlePretestError(error, res, 'addQuestion');
  }
};

export const getPretestByModul = async (req: Request, res: Response) => {
  try {
    const payload = await getPretestQuestions(req.params.modulId as string);

    return res.status(200).json(payload);
  } catch (error) {
    return handlePretestError(error, res, 'get');
  }
};

export const getAllTutorPretest = async (req: Request, res: Response) => {
  try {
    const tutorId = req.user?.id;
    const { limit, cursor } = parsePaginationQuery(req.query);
    const payload = await getAllPretest(tutorId as string, limit, cursor);
    return res.status(200).json(payload);
  } catch (error) {
    return handlePretestError(error, res, 'getAll');
  }
};

export const getTutorPretestById = async (req: Request, res: Response) => {
  try {
    const payload = await getPretestById(
      req.params.pretestId as string,
      req.user?.id,
    );
    return res.status(200).json(payload);
  } catch (error) {
    return handlePretestError(error, res, 'getById');
  }
};

export const updateTutorPretest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = await updatePretestRecord(
      id as string,
      req.body,
      req.user?.id,
    );
    return res.status(200).json(payload);
  } catch (error) {
    return handlePretestError(error, res, 'update');
  }
};

export const deleteTutorPretest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = await deletePretestRecord(id as string, req.user?.id);
    return res.status(200).json(payload);
  } catch (error) {
    return handlePretestError(error, res, 'delete');
  }
};

export const updateSoalPretest = async (req: Request, res: Response) => {
  try {
    const { soalId } = req.params;
    const payload = await updatePretestQuestion(
      soalId as string,
      req.body,
      req.user?.id,
    );
    return res.status(200).json(payload);
  } catch (error) {
    return handlePretestError(error, res, 'updateSoal');
  }
};

export const deleteSoalPretest = async (req: Request, res: Response) => {
  try {
    const { soalId } = req.params;
    const payload = await deletePretestQuestion(
      soalId as string,
      req.user?.id,
    );
    return res.status(200).json(payload);
  } catch (error) {
    return handlePretestError(error, res, 'deleteSoal');
  }
};

export const updateTutorPretestSettings = async (
  req: Request,
  res: Response,
) => {
  try {
    const { pretestId } = req.params;
    const payload = await upsertPretestSettings(
      pretestId as string,
      req.body,
      req.user?.id,
    );
    return res.status(200).json(payload);
  } catch (error) {
    return handlePretestError(error, res, 'updateSettings');
  }
};

export const deleteAllPretestSoal = async (req: Request, res: Response) => {
  try {
    const { pretestId } = req.params;
    await deleteAllPretestQuestions(pretestId as string, req.user?.id);
    return res.status(200).json({ message: 'Semua soal pretest berhasil dihapus.' });
  } catch (error) {
    return handlePretestError(error, res, 'deleteAllSoal');
  }
};

export const submitPretest = async (req: Request, res: Response) => {
  return res.status(403).json({
    message: 'Tutor tidak memiliki akses untuk submit pretest.',
  });
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

  console.error(getPretestLogMessage(action), error);

  return res.status(500).json({ message: getPretestInternalMessage(action) });
}

function getPretestLogMessage(action: PretestAction) {
  const messages: Record<PretestAction, string> = {
    create: '[PRETEST-ERROR] Gagal membuat pretest:',
    addQuestion: '[PRETEST-ERROR] Gagal menambah soal pretest:',
    get: '[PRETEST-ERROR] Gagal mengambil pretest:',
    getAll: '[PRETEST-ERROR] Gagal mengambil daftar pretest:',
    getById: '[PRETEST-ERROR] Gagal mengambil pretest by ID:',
    update: '[PRETEST-ERROR] Gagal mengupdate pretest:',
    delete: '[PRETEST-ERROR] Gagal menghapus pretest:',
    updateSoal: '[PRETEST-ERROR] Gagal mengupdate soal pretest:',
    deleteSoal: '[PRETEST-ERROR] Gagal menghapus soal pretest:',
    deleteAllSoal: '[PRETEST-ERROR] Gagal menghapus semua soal pretest:',
    updateSettings: '[PRETEST-ERROR] Gagal mengupdate settings pretest:',
    submit: '[PRETEST-ERROR] Gagal submit pretest:',
  };

  return messages[action];
}

function getPretestInternalMessage(action: PretestAction) {
  const messages: Record<PretestAction, string> = {
    create: 'Internal server error saat membuat pretest.',
    addQuestion: 'Internal server error saat menambah soal.',
    get: 'Internal server error saat mengambil pretest.',
    getAll: 'Internal server error saat mengambil daftar pretest.',
    getById: 'Internal server error saat mengambil pretest by ID.',
    update: 'Internal server error saat mengupdate pretest.',
    delete: 'Internal server error saat menghapus pretest.',
    updateSoal: 'Internal server error saat mengupdate soal pretest.',
    deleteSoal: 'Internal server error saat menghapus soal pretest.',
    deleteAllSoal: 'Internal server error saat menghapus semua soal pretest.',
    updateSettings: 'Internal server error saat mengupdate settings pretest.',
    submit: 'Internal server error saat submit pretest.',
  };

  return messages[action];
}
