import { prisma } from '../lib/prisma';
import {
  CreateQuizInput,
  CreateQuizAnswerOptionInput,
  CreateQuizSettingInput,
  QuizPayload,
} from '@/validators/kuis/kuis.validator';

export const createKuis = async (payload: QuizPayload) => {
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
