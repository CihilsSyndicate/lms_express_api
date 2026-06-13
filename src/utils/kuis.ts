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

    console.log(payload);

    const newQuiz = await prisma.quiz.create({
      data: {
        ...quiz,
        quizImgQuestionUrl: quiz.quizImgQuestionUrl ?? null,
        quizAnswerOptions: {
          createMany: { data: answerOptions },
        },
        // create quiz setting in a nested create so Prisma links it to the new quiz
        quizSettings: {
          create: {
            timeLimit: setting.timeLimit ?? null,
            minScoreTreshold: setting.minScoreTreshold ?? null,
          },
        },
      },
    });

    const lastItem = await prisma.topikItem.findFirst({
      where: { topikId: quiz.topikId },
      orderBy: { orderNumber: 'desc' },
    });

    await prisma.topikItem.create({
      data: {
        topikId: quiz.topikId,
        itemId: newQuiz.id,
        itemType: 'QUIZ',
        orderNumber: (lastItem?.orderNumber ?? 0) + 1,
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
        tutor: true,
        topiks: {
          include: {
            materis: true,
            quizzes: true,
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
        quizSettings: true,
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

interface CreateQuizTxInput {
  quiz: CreateQuizInput;
  answerOptions: { option: string }[];
  setting: Omit<CreateQuizSettingInput, 'quizId'>;
}

export const createQuizWithTransaction = async (payload: CreateQuizTxInput) => {
  const { quiz, answerOptions, setting } = payload;

  return prisma.$transaction(async (tx) => {
    const newQuiz = await tx.quiz.create({
      data: {
        topikId: quiz.topikId,
        quizType: quiz.quizType ?? 'REGULER',
        quizImgQuestionUrl: quiz.quizImgQuestionUrl ?? null,
        question: quiz.question,
        correctAnswer: quiz.correctAnswer,
        skor: quiz.skor,
      },
    });

    if (answerOptions.length > 0) {
      await tx.quizAnswerOption.createMany({
        data: answerOptions.map((opt) => ({
          quizId: newQuiz.id,
          option: opt.option,
        })),
      });
    }

    await tx.quizSetting.create({
      data: {
        quizId: newQuiz.id,
        timeLimit: setting.timeLimit ?? null,
        allowMultipleAttempts: setting.allowMultipleAttempts ?? false,
        isComputationalThinkingEnabled:
          setting.isComputationalThinkingEnabled ?? false,
        minScoreTreshold: setting.minScoreTreshold ?? null,
        standardScorePerQuestion: setting.standardScorePerQuestion ?? 100,
      },
    });

    return tx.quiz.findUnique({
      where: { id: newQuiz.id },
      include: {
        quizAnswerOptions: true,
        quizSettings: true,
      },
    });
  });
};

export const updateQuizWithTransaction = async (
  quizId: string,
  payload: {
    question?: string | undefined;
    correctAnswer?: string | undefined;
    skor?: number | undefined;
    quizType?: 'REGULER' | 'COMPUTATIONAL_THINKING' | undefined;
    quizImgQuestionUrl?: string | null | undefined;
    answerOptions?: { option: string }[] | undefined;
    setting?:
      | {
          timeLimit?: number | null | undefined;
          allowMultipleAttempts?: boolean | undefined;
          isComputationalThinkingEnabled?: boolean | undefined;
          minScoreTreshold?: number | null | undefined;
          standardScorePerQuestion?: number | undefined;
        }
      | undefined;
  },
) => {
  return prisma.$transaction(async (tx) => {
    const updateData: Record<string, unknown> = {};
    if (payload.question !== undefined) updateData.question = payload.question;
    if (payload.correctAnswer !== undefined) updateData.correctAnswer = payload.correctAnswer;
    if (payload.skor !== undefined) updateData.skor = payload.skor;
    if (payload.quizType !== undefined) updateData.quizType = payload.quizType;
    if (payload.quizImgQuestionUrl !== undefined) updateData.quizImgQuestionUrl = payload.quizImgQuestionUrl;

    if (Object.keys(updateData).length > 0) {
      await tx.quiz.update({
        where: { id: quizId },
        data: updateData,
      });
    }

    if (payload.answerOptions) {
      await tx.quizAnswerOption.deleteMany({ where: { quizId } });
      await tx.quizAnswerOption.createMany({
        data: payload.answerOptions.map((opt) => ({ quizId, option: opt.option })),
      });
    }

    if (payload.setting) {
      await tx.quizSetting.deleteMany({ where: { quizId } });
      await tx.quizSetting.create({
        data: {
          quizId,
          timeLimit: payload.setting.timeLimit ?? null,
          allowMultipleAttempts: payload.setting.allowMultipleAttempts ?? false,
          isComputationalThinkingEnabled:
            payload.setting.isComputationalThinkingEnabled ?? false,
          minScoreTreshold: payload.setting.minScoreTreshold ?? null,
          standardScorePerQuestion: payload.setting.standardScorePerQuestion ?? 100,
        },
      });
    }

    return tx.quiz.findUnique({
      where: { id: quizId },
      include: { quizAnswerOptions: true, quizSettings: true },
    });
  });
};

export const deleteQuiz = async (quizId: string) => {
  try {
    await prisma.topikItem.deleteMany({ where: { itemId: quizId } });
    await prisma.quiz.delete({
      where: { id: quizId },
    });
    return { message: 'Quiz deleted successfully' };
  } catch (error) {
    console.error('Error deleting quiz:', error);
    throw error;
  }
};
