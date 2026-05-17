import { prisma } from '../lib/prisma';
import {
  CreateQuizInput,
  CreateQuizAnswerOptionInput,
  CreateQuizSettingInput,
  QuizPayload,
} from '@/validators/kuis/kuis.validator';
import {
  buildCursorPaginatedResponse,
  buildCursorWhere,
  decodeCursor,
} from './pagination';

export const createQuiz = async (payload: QuizPayload) => {
  try {
    const { quiz, answerOptions, setting } = payload;

    const newQuiz = await prisma.quiz.create({
      data: {
        ...quiz,
        quizImgQuestionUrl: quiz.quizImgQuestionUrl ?? null,
        quizAnswerOptions: {
          createMany: { data: answerOptions },
        },
        quizSetting: {
          create: setting,
        },
      },
    });

    return newQuiz;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
};

export const getAllQuiz = async (limit: number = 10, cursor?: string) => {
  try {
    const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
    const where = buildCursorWhere(cursorPayload);

    const quizzes = await prisma.modul.findMany({
      where,
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        topiks: {
          include: {
            modul: {
              include: {
                tutor: true,
              },
            },
            materis: {
              include: {
                quizzes: true,
              },
            },
          },
        },
      },
    });

    return buildCursorPaginatedResponse(quizzes, limit, (item) => ({
      createdAt: item.createdAt,
      id: item.id,
    }));
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
};

export const getQuizById = async (quizId: string) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        quizAnswerOptions: true,
        quizSetting: true,
      },
    });
    return quiz;
  } catch (error) {
    console.error('Error fetching quiz by ID:', error);
    throw error;
  }
};

export const updateQuiz = async (quizId: string, payload: CreateQuizInput) => {
  try {
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        ...payload,
        quizImgQuestionUrl: payload.quizImgQuestionUrl ?? null,
      },
    });
    return updatedQuiz;
  } catch (error) {
    console.error('Error updating quiz:', error);
    throw error;
  }
};

export const deleteQuiz = async (quizId: string) => {
  try {
    await prisma.quiz.delete({
      where: { id: quizId },
    });
    return { message: 'Quiz deleted successfully' };
  } catch (error) {
    console.error('Error deleting quiz:', error);
    throw error;
  }
};
