import { Request, Response } from 'express';
import { submitQuizAnswer } from '@/utils/studentQuiz';
import { AppError } from '@/errors/app.error';

export const submitUmumQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId, answer, knowledgeComponentId } = req.body;
    const userId = req.user?.id;

    if (!userId) throw new AppError(401, 'Unauthorized');

    const result = await submitQuizAnswer(userId, quizId, answer, knowledgeComponentId);

    return res.status(200).json({
      message: 'Quiz submitted successfully',
      ...result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('[UMUM-QUIZ-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
