import { prisma } from '@/lib/prisma';
import { AppError } from '@/errors/app.error';
import * as bktService from '@/modules/access/siswa/learning/bkt/bkt.service';
import { pushNotification } from '@/utils/realtime';

export const submitQuizAnswer = async (
  siswaId: string,
  quizId: string,
  answer: string,
  knowledgeComponentId: string,
  timeSpent?: number,
) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      topik: { include: { modul: true } },
      quizSettings: true,
    },
  });

  if (!quiz) {
    throw new AppError(404, 'Quiz tidak ditemukan.');
  }

  // Server-side time validation — reject submissions that exceed timeLimit + 30s
  const settings = quiz.quizSettings[0];
  if (settings && settings.timeLimit != null && timeSpent != null && timeSpent > settings.timeLimit + 30) {
    throw new AppError(400, 'Waktu pengerjaan telah habis');
  }

  // Enforce Quiz Settings
  if (settings && !settings.allowMultipleAttempts) {
    const existingAttempt = await prisma.studentAnswerLog.findFirst({
      where: {
        siswaId,
        questionId: quizId,
        questionSource: 'QUIZ',
      },
    });
    if (existingAttempt) {
      throw new AppError(
        400,
        'Multiple attempts are not allowed for this quiz.',
      );
    }
  }

  const isCorrect = quiz.correctAnswer === answer;
  const modulId = quiz.topik.modul.id;

  // 1. Record the answer log
  await prisma.studentAnswerLog.create({
    data: {
      siswaId,
      modulId,
      questionSource: 'QUIZ',
      questionId: quizId,
      knowledgeComponentId,
      isCorrect,
      attemptNo: 1,
    },
  });

  // 2. Update BKT State
  await bktService.updateKnowledgeStateWithObservation(
    siswaId,
    modulId,
    knowledgeComponentId,
    isCorrect,
  );

  // 3. Emit WebSocket Event (Mocked or real)
  // We'll call a helper that we can mock in tests
  notifyStateUpdate(siswaId, modulId, knowledgeComponentId);

  return { isCorrect, quizId };
};

export async function notifyStateUpdate(
  siswaId: string,
  modulId: string,
  kcId: string,
) {
  try {
    await pushNotification(
      siswaId,
      'quiz',
      'Update Quiz',
      `Knowledge state diperbarui untuk modul ini.`,
      { modulId, knowledgeComponentId: kcId },
    );
  } catch (err) {
    console.error('[WS-EMIT-ERROR] Gagal mengirim notifikasi realtime:', err);
  }
}
