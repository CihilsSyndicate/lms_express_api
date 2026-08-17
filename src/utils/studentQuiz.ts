import { prisma } from '@/lib/prisma';
import { AppError } from '@/errors/app.error';
import * as bktService from '@/modules/access/siswa/learning/bkt/bkt.service';
import { pushNotification } from '@/utils/realtime';

// ─── Canonical progress helpers (mirror of progress.service.ts) ─────────────

function getSequenceStepsFromModul(modul: {
  pretest: unknown;
  posttest: unknown;
  topiks: Array<{
    topikItems: Array<{ itemId: string; itemType: string }>;
    quizzes: Array<{ id: string; quizGroupId: string | null; ctGroupId: string | null }>;
  }>;
}): { stepKeys: string[]; groupMembers: Map<string, string[]> } {
  const stepKeys: string[] = [];
  const seen = new Set<string>();
  const groupMembers = new Map<string, string[]>();

  if (modul.pretest) {
    stepKeys.push('pretest');
    seen.add('pretest');
  }

  for (const topik of modul.topiks) {
    for (const ti of topik.topikItems) {
      if (
        (ti.itemType === 'MATERI' || ti.itemType === 'RANGKUMAN_TOPIK') &&
        !seen.has(ti.itemId)
      ) {
        stepKeys.push(ti.itemId);
        seen.add(ti.itemId);
      }
    }
  }

  for (const topik of modul.topiks) {
    for (const quiz of topik.quizzes) {
      const groupKey = quiz.quizGroupId ?? quiz.ctGroupId;
      if (groupKey) {
        const members = groupMembers.get(groupKey) ?? [];
        if (!members.includes(quiz.id)) members.push(quiz.id);
        groupMembers.set(groupKey, members);
        if (!seen.has(groupKey)) {
          stepKeys.push(groupKey);
          seen.add(groupKey);
        }
      } else if (!seen.has(quiz.id)) {
        stepKeys.push(quiz.id);
        seen.add(quiz.id);
      }
    }
  }

  if (modul.posttest) {
    stepKeys.push('posttest');
    seen.add('posttest');
  }

  return { stepKeys, groupMembers };
}

function progressPercentageFromEntries(
  entries: Array<{ itemId: string; itemType: string; completedAt: string }>,
  progress: {
    status: string;
    isGraduated: boolean;
    pretestScore: number | null;
    posttestScore: number | null;
  },
  steps: { stepKeys: string[]; groupMembers: Map<string, string[]> },
): number {
  if (progress.status === 'COMPLETED' || progress.isGraduated) return 100;
  const completedSet = new Set(entries.map((e) => e.itemId));
  let completedSteps = 0;
  for (const stepKey of steps.stepKeys) {
    if (stepKey === 'pretest') {
      if (progress.pretestScore != null) completedSteps += 1;
    } else if (stepKey === 'posttest') {
      if (progress.posttestScore != null || completedSet.has('posttest')) completedSteps += 1;
    } else {
      const members = steps.groupMembers.get(stepKey);
      if (members) {
        if (completedSet.has(stepKey) || members.some((m) => completedSet.has(m))) {
          completedSteps += 1;
        }
      } else if (completedSet.has(stepKey)) {
        completedSteps += 1;
      }
    }
  }
  return steps.stepKeys.length > 0
    ? Math.min(100, Math.round((completedSteps / steps.stepKeys.length) * 100))
    : 0;
}

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
      await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "Progress" WHERE "siswaId" = ${siswaId} AND "modulId" = ${modulId} FOR UPDATE`;
        const progressRow = await tx.progress.findUnique({
          where: { siswaId_modulId: { siswaId, modulId } },
        });
        if (!progressRow) return;
        const items: Array<{ itemId: string; itemType: string; completedAt: string }> = (() => {
          try {
            const parsed = JSON.parse(progressRow.completedContentItems || '[]');
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
          const modul = await tx.modul.findUnique({
            where: { id: modulId },
            include: {
              topiks: {
                include: {
                  topikItems: true,
                  quizzes: { select: { id: true, quizGroupId: true, ctGroupId: true } },
                },
              },
              pretest: true,
              posttest: true,
            },
          });
          const steps = modul ? getSequenceStepsFromModul(modul) : { stepKeys: [], groupMembers: new Map<string, string[]>() };
          const progressPercentage = progressPercentageFromEntries(items, progressRow, steps);
          await tx.progress.update({
            where: { id: progressRow.id },
            data: { completedContentItems: JSON.stringify(items), progressPercentage },
          });
        }
      });
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
