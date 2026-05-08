import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import {
  createPosttestRecord,
  addPosttestQuestion,
  getPosttestQuestions,
  submitPosttestAnswer,
} from '@/utils/posttest';

type PosttestAction = 'create' | 'addQuestion' | 'get' | 'submit';

/**
 * Learning Module Wrapper - Posttest Controller
 * Handles authorization and delegates to business logic.
 * Supports both siswa (read and submit) and tutor (create and add questions) operations.
 */

export const createPosttest = async (req: Request, res: Response) => {
  try {
    const newPosttest = await createPosttestRecord(
      req.body.modul_id,
      req.user?.id,
    );

    return res
      .status(201)
      .json({ message: 'Posttest berhasil dibuat', data: newPosttest });
  } catch (error) {
    return handlePosttestError(error, res, 'create');
  }
};

export const addSoalPosttest = async (req: Request, res: Response) => {
  try {
    const newSoal = await addPosttestQuestion(req.body, req.user?.id);

    return res
      .status(201)
      .json({ message: 'Soal posttest berhasil ditambah', data: newSoal });
  } catch (error) {
    return handlePosttestError(error, res, 'addQuestion');
  }
};

export const getPosttestByModul = async (req: Request, res: Response) => {
  try {
    const posttest = await getPosttestQuestions(req.params.modulId as string);

    return res
      .status(200)
      .json({ message: 'Berhasil mengambil posttest', data: posttest });
  } catch (error) {
    return handlePosttestError(error, res, 'get');
  }
};

export const submitPosttest = async (req: Request, res: Response) => {
  try {
    const result = await submitPosttestAnswer(
      req.params.modulId as string,
      req.body.answers,
      req.user?.id,
      req.user?.role,
    );

    return res.status(200).json({
      message: 'Posttest berhasil disubmit',
      score: result.score,
      certificate: result.certificate,
    });
  } catch (error) {
    return handlePosttestError(error, res, 'submit');
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
    submit: '[POSTTEST-ERROR] Gagal submit posttest:',
  };

  return messages[action];
}

function getPosttestInternalMessage(action: PosttestAction) {
  const messages: Record<PosttestAction, string> = {
    create: 'Internal server error saat membuat posttest.',
    addQuestion: 'Internal server error saat menambah soal.',
    get: 'Internal server error saat mengambil posttest.',
    submit: 'Internal server error saat submit posttest.',
  };

  return messages[action];
}
