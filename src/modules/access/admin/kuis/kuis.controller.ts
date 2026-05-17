import { prisma } from '@/lib/prisma';
import { Request, Response } from 'express';
import {
  createQuiz as createQuizFunc,
  getAllQuiz as getAllQuizFunc,
  getQuizById as getQuizByIdFunc,
  updateQuiz as updateQuizFunc,
  deleteQuiz as deleteQuizFunc,
} from '@/utils/kuis';
import { parsePaginationQuery } from '@/utils/pagination';

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const payload = await createQuizFunc(req.body);
    res.status(201).json(payload);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};
export const getAllQuiz = async (req: Request, res: Response) => {
  try {
    const { limit, cursor } = parsePaginationQuery(req.query);
    const quizzes = await getAllQuizFunc(limit, cursor);
    res.status(200).json(quizzes);
  } catch (error: any) {
    console.error('Error fetching quizzes:', error);
    if (
      error.message === 'Invalid limit parameter' ||
      error.message === 'Invalid cursor'
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

export const getQuizById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const quiz = await getQuizByIdFunc(id as string);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error fetching quiz by ID:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = await updateQuizFunc(id as string, req.body);
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update quiz' });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = await deleteQuizFunc(id as string);
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};
