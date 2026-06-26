import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import {
  createPretestRecord,
  addPretestQuestion,
  getPretestQuestions,
  getAllPretestAdmin,
  getPretestById,
  updatePretestRecord,
  deletePretestRecord,
  updatePretestQuestion,
  deletePretestQuestion,
  upsertPretestSettings,
  deleteAllPretestQuestions,
} from '@/utils/pretest';
import { parsePaginationQuery } from '@/utils/pagination';

type AdminPretestAction =
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
  | 'updateSettings';

export const createPretest = async (req: Request, res: Response) => {
  try {
    const payload = await createPretestRecord(
      req.body.modul_id,
      req.user?.id,
      req.body.pretestSettings,
      true,
    );
    return res.status(201).json(payload);
  } catch (error) {
    return handleError(error, res, 'create');
  }
};

export const addSoalPretest = async (req: Request, res: Response) => {
  try {
    const payload = await addPretestQuestion(req.body, req.user?.id, true);
    return res.status(201).json(payload);
  } catch (error) {
    return handleError(error, res, 'addQuestion');
  }
};

export const getPretestByModul = async (req: Request, res: Response) => {
  try {
    const payload = await getPretestQuestions(req.params.modulId as string);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'get');
  }
};

export const getAllPretest = async (req: Request, res: Response) => {
  try {
    const { limit, cursor } = parsePaginationQuery(req.query);
    const payload = await getAllPretestAdmin(limit, cursor);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'getAll');
  }
};

export const getPretestByIdHandler = async (req: Request, res: Response) => {
  try {
    const payload = await getPretestById(req.params.pretestId as string);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'getById');
  }
};

export const updatePretest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = await updatePretestRecord(id as string, req.body);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'update');
  }
};

export const deletePretest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = await deletePretestRecord(id as string);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'delete');
  }
};

export const updateSoalPretest = async (req: Request, res: Response) => {
  try {
    const { soalId } = req.params;
    const payload = await updatePretestQuestion(soalId as string, req.body);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'updateSoal');
  }
};

export const deleteSoalPretest = async (req: Request, res: Response) => {
  try {
    const { soalId } = req.params;
    const payload = await deletePretestQuestion(soalId as string);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'deleteSoal');
  }
};

export const updatePretestSettings = async (req: Request, res: Response) => {
  try {
    const { pretestId } = req.params;
    const payload = await upsertPretestSettings(
      pretestId as string,
      req.body,
    );
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'updateSettings');
  }
};

export const deleteAllPretestSoal = async (req: Request, res: Response) => {
  try {
    const { pretestId } = req.params;
    await deleteAllPretestQuestions(pretestId as string);
    return res.status(200).json({ message: 'Semua soal pretest berhasil dihapus.' });
  } catch (error) {
    return handleError(error, res, 'deleteAllSoal');
  }
};

function handleError(error: unknown, res: Response, action: AdminPretestAction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error(`[ADMIN-PRETEST-ERROR] ${action}:`, error);
  return res.status(500).json({ message: 'Internal server error.' });
}
