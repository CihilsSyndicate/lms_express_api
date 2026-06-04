import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import {
  createPosttestRecord,
  addPosttestQuestion,
  getPosttestQuestions,
  getAllPosttestAdmin,
  getPosttestById,
  updatePosttestRecord,
  deletePosttestRecord,
  updatePosttestQuestion,
  deletePosttestQuestion,
} from '@/utils/posttest';
import { parsePaginationQuery } from '@/utils/pagination';

type AdminPosttestAction =
  | 'create'
  | 'addQuestion'
  | 'get'
  | 'getAll'
  | 'getById'
  | 'update'
  | 'delete'
  | 'updateSoal'
  | 'deleteSoal';

export const createPosttest = async (req: Request, res: Response) => {
  try {
    const payload = await createPosttestRecord(
      req.body.modul_id,
      req.user?.id,
      true,
    );
    return res.status(201).json(payload);
  } catch (error) {
    return handleError(error, res, 'create');
  }
};

export const addSoalPosttest = async (req: Request, res: Response) => {
  try {
    const payload = await addPosttestQuestion(req.body, req.user?.id, true);
    return res.status(201).json(payload);
  } catch (error) {
    return handleError(error, res, 'addQuestion');
  }
};

export const getPosttestByModul = async (req: Request, res: Response) => {
  try {
    const payload = await getPosttestQuestions(req.params.modulId as string);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'get');
  }
};

export const getAllPosttest = async (req: Request, res: Response) => {
  try {
    const { limit, cursor } = parsePaginationQuery(req.query);
    const payload = await getAllPosttestAdmin(limit, cursor);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'getAll');
  }
};

export const getPosttestByIdHandler = async (req: Request, res: Response) => {
  try {
    const payload = await getPosttestById(req.params.posttestId as string);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'getById');
  }
};

export const updatePosttest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = await updatePosttestRecord(id as string, req.body);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'update');
  }
};

export const deletePosttest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = await deletePosttestRecord(id as string);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'delete');
  }
};

export const updateSoalPosttest = async (req: Request, res: Response) => {
  try {
    const { soalId } = req.params;
    const payload = await updatePosttestQuestion(soalId as string, req.body);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'updateSoal');
  }
};

export const deleteSoalPosttest = async (req: Request, res: Response) => {
  try {
    const { soalId } = req.params;
    const payload = await deletePosttestQuestion(soalId as string);
    return res.status(200).json(payload);
  } catch (error) {
    return handleError(error, res, 'deleteSoal');
  }
};

function handleError(error: unknown, res: Response, action: AdminPosttestAction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error(`[ADMIN-POSTTEST-ERROR] ${action}:`, error);
  return res.status(500).json({ message: 'Internal server error.' });
}
