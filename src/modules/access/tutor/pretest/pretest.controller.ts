import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import {
  createPretestRecord,
  addPretestQuestion,
  getPretestQuestions,
  submitPretestAnswer,
} from '@/utils/pretest';

type PretestAction = 'create' | 'addQuestion' | 'get' | 'submit';

/**
 * Thin HTTP adapter for Tutor's pretest management operations.
 * Delegates business logic to @/utils/pretest functions.
 * Handles req/res HTTP concerns only.
 * Note: Tutor can create pretest and add questions, but not submit.
 */

export const createPretest = async (req: Request, res: Response) => {
  try {
    const newPretest = await createPretestRecord(
      req.body.modul_id,
      req.user?.id,
    );

    return res
      .status(201)
      .json({ message: 'Pretest berhasil dibuat', data: newPretest });
  } catch (error) {
    return handlePretestError(error, res, 'create');
  }
};

export const addSoalPretest = async (req: Request, res: Response) => {
  try {
    const newSoal = await addPretestQuestion(req.body, req.user?.id);

    return res
      .status(201)
      .json({ message: 'Soal pretest berhasil ditambah', data: newSoal });
  } catch (error) {
    return handlePretestError(error, res, 'addQuestion');
  }
};

export const getPretestByModul = async (req: Request, res: Response) => {
  try {
    const pretest = await getPretestQuestions(req.params.modulId as string);

    return res
      .status(200)
      .json({ message: 'Berhasil mengambil pretest', data: pretest });
  } catch (error) {
    return handlePretestError(error, res, 'get');
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
    submit: '[PRETEST-ERROR] Gagal submit pretest:',
  };

  return messages[action];
}

function getPretestInternalMessage(action: PretestAction) {
  const messages: Record<PretestAction, string> = {
    create: 'Internal server error saat membuat pretest.',
    addQuestion: 'Internal server error saat menambah soal.',
    get: 'Internal server error saat mengambil pretest.',
    submit: 'Internal server error saat submit pretest.',
  };

  return messages[action];
}
