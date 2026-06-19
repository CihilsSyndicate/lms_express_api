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

  // Sequential access: previous TopikItem must be completed.
  // CT quizzes are always submitted together as a group, so skip this check for them —
  // the unlock guard already ran client-side when the student entered the CT quiz session.
  if (quiz.quizType !== 'COMPUTATIONAL_THINKING') {
    const topikItem = await prisma.topikItem.findFirst({
      where: { itemId: quizId, itemType: 'QUIZ' },
    });
    if (topikItem && topikItem.orderNumber > 1) {
      const prevItem = await prisma.topikItem.findFirst({
        where: { topikId: topikItem.topikId, orderNumber: topikItem.orderNumber - 1 },
      });
      if (prevItem) {
        const progress = await prisma.progress.findUnique({
          where: { siswaId_modulId: { siswaId, modulId } },
          select: { completedContentItems: true },
        });
        const completedIds: string[] = (() => {
          try {
            const parsed = JSON.parse(progress?.completedContentItems || '[]');
            return Array.isArray(parsed) ? parsed.map((e: any) => e.itemId).filter(Boolean) : [];
          } catch { return []; }
        })();
        if (!completedIds.includes(prevItem.itemId)) {
          throw new AppError(403, 'Selesaikan konten sebelumnya terlebih dahulu.');
        }
      }
    }
  }

  // Normalize "unknown" KC ID to null to avoid FK constraint violation
  const resolvedKcId = knowledgeComponentId && knowledgeComponentId !== 'unknown'
    ? knowledgeComponentId
    : null;

  // 1. Record the answer log
  await prisma.studentAnswerLog.create({
    data: {
      siswaId,
      modulId,
      questionSource: 'QUIZ',
      questionId: quizId,
      knowledgeComponentId: resolvedKcId,
      isCorrect,
      attemptNo: 1,
    },
  });

  // 2. Update BKT State (skip if KC is unknown/unset — avoids FK constraint violation)
  if (resolvedKcId) {
    await bktService.updateKnowledgeStateWithObservation(
      siswaId,
      modulId,
      resolvedKcId,
      isCorrect,
    );
  }

  // 3. For CT modules: evaluate mastery thresholds and persist newly-unlocked materis
  if (quiz.topik.modul.isTestComputationalThinking && resolvedKcId) {
    const { unlockedMateriIds } = await bktService.evaluateUnlockedContents(siswaId, modulId);
    if (unlockedMateriIds.length > 0) {
      const prog = await prisma.progress.findUnique({
        where: { siswaId_modulId: { siswaId, modulId } },
        select: { id: true, completedContentItems: true },
      });
      if (prog) {
        const items: Array<{ itemId: string; itemType: string; completedAt: string }> = (() => {
          try {
            const parsed = JSON.parse(prog.completedContentItems || '[]');
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })();
        const existingIds = new Set(items.map((e) => e.itemId));
        let changed = false;
        for (const matId of unlockedMateriIds) {
          if (!existingIds.has(matId)) {
            items.push({ itemId: matId, itemType: 'MATERI', completedAt: new Date().toISOString() });
            changed = true;
          }
        }
        if (changed) {
          await prisma.progress.update({
            where: { id: prog.id },
            data: { completedContentItems: JSON.stringify(items) },
          });
        }
      }
    }
  }

  // 4. Emit WebSocket Event (Mocked or real)
  // We'll call a helper that we can mock in tests
  notifyStateUpdate(siswaId, modulId, resolvedKcId ?? '');

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
