import { Request, Response } from 'express';
import { submitQuizAnswer } from '@/utils/studentQuiz';
import { AppError } from '@/errors/app.error';

export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId, answer, knowledgeComponentId, timeSpent } = req.body;
    const siswaId = req.user?.id;

    if (!siswaId) {
      throw new AppError(401, 'Unauthorized');
    }

    const result = await submitQuizAnswer(siswaId, quizId, answer, knowledgeComponentId, timeSpent);

    return res.status(200).json({
      message: 'Quiz submitted successfully',
      ...result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('[QUIZ-SUBMIT-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error during quiz submission' });
  }
};
