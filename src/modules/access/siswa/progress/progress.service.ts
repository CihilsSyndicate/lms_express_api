import { prisma } from '../../../../lib/prisma';
import { Prisma } from '../../../../generated/prisma/client';
import * as bktService from '../learning/bkt/bkt.service';
import {
  buildCursorPaginatedResponse,
  buildCursorWhere,
  decodeCursor,
} from '../../../../utils/pagination';
import { pushNotification } from '../../../../utils/realtime';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, (match) => {
      const code = parseInt(match.slice(2, -1), 10);
      return String.fromCharCode(code);
    });
}

function normalizeAnswer(str: string): string {
  if (typeof str !== 'string') return '';
  let s = str;
  // Decode entities first (handles double-encoded HTML like &lt;div&gt;)
  s = decodeHtmlEntities(s);
  // Strip HTML tags (run twice to catch tags revealed after entity decoding)
  s = s.replace(/<[^>]*>/g, ' ');
  s = decodeHtmlEntities(s);
  s = s.replace(/<[^>]*>/g, ' ');
  // Normalize all whitespace: non-breaking spaces, tabs, newlines → single space
  s = s.replace(/[\u00a0\u200b\u200c\u200d\ufeff]/g, ' ');
  s = s.replace(/\s+/g, ' ');
  return s.trim();
}

/**
 * Find the option index that best matches the given answer text.
 * Returns -1 if no match found.
 */
function findMatchingOptionIndex(options: { option: string }[], answerText: string): number {
  const normAnswer = normalizeAnswer(answerText);
  return options.findIndex(opt => normalizeAnswer(opt.option) === normAnswer);
}

// ─── Canonical progress helpers (single source of truth) ───────────────────

type CompletedEntry = {
  itemId: string;
  itemType: string;
  completedAt: string;
};

interface SequenceSteps {
  stepKeys: string[];
  groupMembers: Map<string, string[]>; // group step key -> member quiz ids
}

function parseCompletedEntries(raw: string | null): CompletedEntry[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Hitung daftar langkah sequence modul: pretest, topikItems MATERI/RANGKUMAN_TOPIK,
 * grup kuis (dedup quizGroupId ?? ctGroupId, termasuk kuis yang tidak direferensikan
 * topikItems), solo kuis, dan posttest. Satu grup kuis = satu langkah.
 */
export async function getSequenceSteps(modulId: string): Promise<SequenceSteps> {
  const modul = await prisma.modul.findUnique({
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

  const empty: SequenceSteps = { stepKeys: [], groupMembers: new Map() };
  if (!modul) return empty;

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

/**
 * Hitung persentase progress dari completedContentItems terhadap langkah sequence.
 * Grup kuis dihitung 1 langkah jika salah satu member-nya ada di daftar completed.
 */
function computeProgressPercentage(
  entries: CompletedEntry[],
  steps: SequenceSteps,
  pretestScore: number | null,
  posttestScore: number | null,
): number {
  const completedSet = new Set(entries.map((e) => e.itemId));
  let completedSteps = 0;

  for (const stepKey of steps.stepKeys) {
    if (stepKey === 'pretest') {
      if (pretestScore != null) completedSteps += 1;
    } else if (stepKey === 'posttest') {
      if (posttestScore != null || completedSet.has('posttest')) completedSteps += 1;
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

export function progressPercentageFor(
  progress: {
    status: string;
    isGraduated: boolean;
    pretestScore: number | null;
    posttestScore: number | null;
    completedContentItems: string;
  },
  steps: SequenceSteps,
): number {
  if (progress.status === 'COMPLETED' || progress.isGraduated) return 100;
  return computeProgressPercentage(
    parseCompletedEntries(progress.completedContentItems),
    steps,
    progress.pretestScore,
    progress.posttestScore,
  );
}

/**
 * Kunci baris Progress (SELECT ... FOR UPDATE) lalu baca di dalam transaction
 * untuk mencegah lost update pada completedContentItems.
 */
async function lockProgressRow(
  tx: Prisma.TransactionClient,
  siswaId: string,
  modulId: string,
) {
  await tx.$queryRaw`SELECT id FROM "Progress" WHERE "siswaId" = ${siswaId} AND "modulId" = ${modulId} FOR UPDATE`;
  return tx.progress.findUnique({
    where: { siswaId_modulId: { siswaId, modulId } },
  });
}

/**
 * Initialize progress saat siswa mulai modul.
 */
export const initializeProgressService = async (
  siswaId: string,
  modulId: string,
): Promise<void> => {
  const existing = await prisma.progress.findUnique({
    where: { siswaId_modulId: { siswaId: siswaId, modulId: modulId } },
  });

  if (existing) return; // Already initialized

  await prisma.progress.create({
    data: {
      siswaId: siswaId,
      modulId: modulId,
      progressPercentage: 0,
    },
  });
};

/**
 * Get progress per modul untuk siswa.
 */
export const getProgressByModuleService = async (
  siswaId: string,
  modulId: string,
) => {
  const progress = await prisma.progress.findUnique({
    where: { siswaId_modulId: { siswaId: siswaId, modulId: modulId } },
    include: {
      modul: true,
    },
  });

  if (!progress) return null;

  const totalMateris = await prisma.materi.count({
    where: { topik: { modulId: modulId } },
  });

  const completedMateris = await prisma.progressDetail.count({
    where: {
      siswaId: siswaId,
      isCompleted: true,
      materi: { topik: { modulId: modulId } },
    },
  });

  const completionRate =
    totalMateris > 0
      ? Math.round((completedMateris / totalMateris) * 100)
      : 0;

  const completedContentItems: string[] = (() => {
    try {
      const parsed = JSON.parse(progress.completedContentItems || '[]');
      if (Array.isArray(parsed)) return parsed.map((entry: any) => entry.itemId).filter(Boolean);
      return [];
    } catch {
      return [];
    }
  })();

  return {
    ...progress,
    completionRate,
    completedContentItems,
  };
};

/**
 * Get semua progress siswa.
 */
export const getAllProgressForSiswaService = async (
  siswaId: string,
  limit: number = 10,
  cursor?: string,
) => {
  const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
  const cursorWhere = buildCursorWhere(cursorPayload);

  const progresses = await prisma.progress.findMany({
    where: {
      AND: [{ siswaId: siswaId }, cursorWhere],
    },
    take: limit + 1,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: {
      modul: {
        select: { moduleName: true, level: true, class: true },
      },
    },
  });

  return buildCursorPaginatedResponse(progresses, limit, (item: any) => ({
    createdAt: item.createdAt,
    id: item.id,
  }));
};

/**
 * Update last accessed.
 */
export const updateLastAccessedService = async (
  siswaId: string,
  modulId: string,
): Promise<void> => {
  await prisma.progress.updateMany({
    where: { siswaId: siswaId, modulId: modulId },
    data: { lastAccessed: new Date() },
  });
};

/**
 * Tandai materi completed.
 */
export const markMateriCompletedService = async (
  siswaId: string,
  materiId: string,
) => {
  const materi = await prisma.materi.findUnique({
    where: { id: materiId },
    include: { topik: { include: { modul: true } } },
  });

  if (!materi) throw new Error('Materi tidak ditemukan');

  await initializeProgressService(
    siswaId,
    (materi as any).topik.modulId,
  );

  const existingDetail = await prisma.progressDetail.findFirst({
    where: {
      siswaId: siswaId,
      materiId: materiId,
    },
  });

  await prisma.progressDetail.upsert({
    where: {
      id: (existingDetail?.id as string) || 'new-id',
    },
    update: {
      isCompleted: true,
      completed_at: new Date(),
    },
    create: {
      siswaId: siswaId,
      materiId: materiId,
      isCompleted: true,
      completed_at: new Date(),
    },
  });

  // Sync progress summary
  await bktService.syncModuleProgressSummary(
    siswaId,
    (materi as any).topik.modulId,
  );

  const modulId = (materi as any).topik.modulId;

  // Track in completedContentItems so tutor/admin views count it correctly
  await prisma.$transaction(async (tx: any) => {
    const progressRec = await lockProgressRow(tx, siswaId, modulId);
    if (!progressRec) return;

    const completedItems = parseCompletedEntries(progressRec.completedContentItems);
    if (completedItems.some((e) => e.itemId === materiId)) return;

    completedItems.push({
      itemId: materiId,
      itemType: 'MATERI',
      completedAt: new Date().toISOString(),
    });

    const steps = await getSequenceSteps(modulId);
    const progressPercentage = progressPercentageFor(
      { ...progressRec, completedContentItems: JSON.stringify(completedItems) },
      steps,
    );

    await tx.progress.update({
      where: { id: progressRec.id },
      data: { completedContentItems: JSON.stringify(completedItems), progressPercentage },
    });
  });

  const progress = await prisma.progress.findUnique({
    where: { siswaId_modulId: { siswaId, modulId } },
    include: { modul: true },
  });

  return { message: 'Materi berhasil ditandai selesai.', progress };
};

/**
 * Tandai item konten selesai (generic untuk semua tipe: QUIZ, RATING, PRETEST, POSTTEST, CERTIFICATE, SUBMATERI, SUMMARY).
 */
export const markItemCompletedService = async (
  siswaId: string,
  itemId: string,
  itemType: string,
  modulId: string,
) => {
  await initializeProgressService(siswaId, modulId);

  await prisma.$transaction(async (tx: any) => {
    const progress = await lockProgressRow(tx, siswaId, modulId);

    if (!progress) throw new Error('Progress tidak ditemukan');

    const completedItems = parseCompletedEntries(progress.completedContentItems);

    const alreadyCompleted = completedItems.some((entry) => entry.itemId === itemId);

    if (!alreadyCompleted) {
      completedItems.push({
        itemId,
        itemType: itemType.toUpperCase(),
        completedAt: new Date().toISOString(),
      });
    }

    // If marking a QUIZ item, also mark all sibling quizzes in the same QuizGroup
    if (itemType.toUpperCase() === 'QUIZ') {
      try {
        const quizRecord = await tx.quiz.findUnique({
          where: { id: itemId },
          select: { quizGroupId: true, quizType: true, ctGroupId: true },
        });
        if (quizRecord?.quizGroupId) {
          const siblingQuizzes = await tx.quiz.findMany({
            where: {
              quizGroupId: quizRecord.quizGroupId,
              id: { not: itemId },
              ...(quizRecord.quizType === 'COMPUTATIONAL_THINKING' && quizRecord.ctGroupId
                ? { ctGroupId: quizRecord.ctGroupId }
                : {}),
            },
            select: { id: true },
          });
          for (const sq of siblingQuizzes) {
            if (!completedItems.some((e) => e.itemId === sq.id)) {
              completedItems.push({
                itemId: sq.id,
                itemType: 'QUIZ',
                completedAt: new Date().toISOString(),
              });
            }
          }
        }
      } catch (err) {
        console.error('Error marking sibling quizzes:', err);
      }
    }

    const steps = await getSequenceSteps(modulId);
    const progressPercentage = progressPercentageFor(
      { ...progress, completedContentItems: JSON.stringify(completedItems) },
      steps,
    );

    await tx.progress.update({
      where: { id: progress.id },
      data: {
        completedContentItems: JSON.stringify(completedItems),
        progressPercentage,
      },
    });
  });

  await bktService.syncModuleProgressSummary(siswaId, modulId);

  const updatedProgress = await prisma.progress.findUnique({
    where: { siswaId_modulId: { siswaId, modulId } },
    include: { modul: true },
  });

  return { message: 'Item berhasil ditandai selesai.', progress: updatedProgress };
};

/**
 * Cek completion materi.
 */
export const isMateriCompletedService = async (
  siswaId: string,
  materiId: string,
): Promise<boolean> => {
  const detail = await prisma.progressDetail.findFirst({
    where: {
      siswaId: siswaId,
      materiId: materiId,
    },
  });

  return detail?.isCompleted ?? false;
};

/**
 * Submit jawaban pretest dan hitung skor.
 */
export const calculatePretestScoreService = async (
  siswaId: string,
  modulId: string,
  answers: Array<{ questionId: string; answer: string }>,
  timeSpent?: number,
): Promise<{
  score: number;
  totalBenar: number;
  totalSalah: number;
  unlockedCount: number;
}> => {
  const pretest = await prisma.pretest.findFirst({
    where: { modul: { id: modulId } },
    include: {
      pretestQuestions: {
        include: {
          answerOptions: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] },
        },
      },
      pretestSettings: true,
    },
  });

  if (!pretest) throw new Error('Pretest tidak ditemukan');

  // Initialize progress
  await initializeProgressService(siswaId, modulId);

  let totalRawScore = 0;
  let maxRawScore = 0;
  let totalBenar = 0;
  let totalSalah = 0;
  const answerLogs: Array<{ questionId: string; isCorrect: boolean }> = [];

  for (const answer of answers) {
    const question = pretest.pretestQuestions.find(
      (item: any) => item.id === answer.questionId,
    );
    if (question) {
      // Find which option the student submitted matches (by normalized text)
      const submittedIdx = findMatchingOptionIndex((question as any).answerOptions ?? [], answer.answer);
      // Find which option is the correct answer
      const correctIdx = findMatchingOptionIndex((question as any).answerOptions ?? [], question.correctAnswer);
      // Primary: index-based comparison (most robust)
      // Fallback: normalized text comparison if no options loaded
      const isCorrect = (correctIdx !== -1 && submittedIdx !== -1)
        ? correctIdx === submittedIdx
        : normalizeAnswer(question.correctAnswer) === normalizeAnswer(answer.answer);
      maxRawScore += question.skor;
      if (isCorrect) {
        totalRawScore += question.skor;
        totalBenar++;
      } else {
        totalSalah++;
      }

      answerLogs.push({ questionId: answer.questionId, isCorrect });

      // Log answer
      await prisma.studentAnswerLog.create({
        data: {
          siswaId: siswaId,
          modulId: modulId,
          questionSource: 'PRETEST',
          questionId: answer.questionId,
          isCorrect: isCorrect,
        },
      });
    }
  }

  // Normalize raw score to a 0-100 scale (if no questions, score 0)
  const totalScore =
    maxRawScore > 0 ? Math.round((totalRawScore / maxRawScore) * 100) : 0;

  // Update progress skor pretest dan kunci agar tidak bisa diulang
  await prisma.progress.updateMany({
    where: { siswaId: siswaId, modulId: modulId },
    data: {
      pretestScore: totalScore,
      pretestCorrectCount: totalBenar,
      pretestWrongCount: totalSalah,
      pretestTimeSpent: timeSpent ?? null,
      pretestCompleted: true,
    },
  });

  // Initialize BKT
  await bktService.initializeKnowledgeStateFromPretest(
    siswaId,
    modulId,
    answerLogs,
  );

  // Rule-based unlock: AutomaticAccessMatery (buka seluruh konten topik target)
  const accessRules = await prisma.automaticAccessMatery.findMany({
    where: { pretestId: pretest.id },
    select: { minScore: true, selectedTopics: { select: { id: true } } },
  });

  let unlockedCount = 0;

  await prisma.$transaction(async (tx: any) => {
    const progressRecord = await lockProgressRow(tx, siswaId, modulId);
    if (!progressRecord) return;

    const completedItems = parseCompletedEntries(progressRecord.completedContentItems);
    const existingIds = new Set(completedItems.map((e) => e.itemId));

    const pushItems = (itemIds: string[], itemType: string) => {
      for (const id of itemIds) {
        if (!existingIds.has(id)) {
          completedItems.push({ itemId: id, itemType, completedAt: new Date().toISOString() });
          existingIds.add(id);
          unlockedCount++;
        }
      }
    };

    for (const rule of accessRules) {
      if (totalScore < rule.minScore) continue;
      const targetTopicIds = rule.selectedTopics.map((t: any) => t.id);
      if (targetTopicIds.length === 0) continue;
      const targetTopikItems = await tx.topikItem.findMany({
        where: { topikId: { in: targetTopicIds } },
        select: { itemId: true, itemType: true },
      });
      const targetQuizzes = await tx.quiz.findMany({
        where: { topikId: { in: targetTopicIds } },
        select: { id: true },
      });
      pushItems(
        targetTopikItems
          .filter((ti: any) => ti.itemType === 'MATERI' || ti.itemType === 'RANGKUMAN_TOPIK')
          .map((ti: any) => ti.itemId),
        'MATERI',
      );
      pushItems(targetQuizzes.map((q: any) => q.id), 'QUIZ');
    }

    // Formula-based sequential unlock: first N materis in topic/item order
    const totalMateris = await tx.materi.count({ where: { topik: { modulId } } });
    const formulaCount = totalMateris > 0 ? Math.max(Math.floor(totalMateris * totalScore / 100), 1) : 0;
    if (formulaCount > 0) {
      const orderedTopikItems = await tx.topikItem.findMany({
        where: { topik: { modulId }, itemType: 'MATERI' },
        select: { itemId: true },
        orderBy: [{ topik: { createdAt: 'asc' } }, { orderNumber: 'asc' }],
        take: formulaCount,
      });
      pushItems(orderedTopikItems.map((ti: any) => ti.itemId), 'MATERI');
    }

    if (unlockedCount > 0) {
      const steps = await getSequenceSteps(modulId);
      const progressPercentage = progressPercentageFor(
        { ...progressRecord, completedContentItems: JSON.stringify(completedItems) },
        steps,
      );
      await tx.progress.updateMany({
        where: { siswaId, modulId },
        data: { completedContentItems: JSON.stringify(completedItems), progressPercentage },
      });
    }
  });

  // Sync summary
  await bktService.syncModuleProgressSummary(siswaId, modulId);

  const updatedProg = await prisma.progress.findUnique({
    where: { siswaId_modulId: { siswaId, modulId } },
    select: { isGraduated: true },
  });

  return { score: totalScore, totalBenar, totalSalah, unlockedCount };
};

/**
 * Submit jawaban posttest dan hitung skor.
 */
export const calculatePosttestScoreService = async (
  siswaId: string,
  modulId: string,
  answers: Array<{ questionId: string; answer: string }>,
  timeSpent?: number,
): Promise<{
  score: number;
  totalBenar: number;
  totalSalah: number;
  isGraduated: boolean;
}> => {
  const posttest = await prisma.posttest.findFirst({
    where: { modul: { id: modulId } },
    include: { posttestSettings: true },
  });

  if (!posttest) throw new Error('Posttest tidak ditemukan');

  // Initialize progress
  await initializeProgressService(siswaId, modulId);

  const pretest = await prisma.pretest.findFirst({
    where: { modul: { id: modulId } },
    include: {
      pretestQuestions: {
        include: {
          answerOptions: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] },
        },
      },
    },
  });

  if (!pretest) throw new Error('Pretest tidak ditemukan');

  let totalRawScore = 0;
  let maxRawScore = 0;
  let totalBenar = 0;
  let totalSalah = 0;

  for (const answer of answers) {
    const question = pretest.pretestQuestions.find(
      (item: any) => item.id === answer.questionId,
    );
    if (question) {
      const submittedIdx = findMatchingOptionIndex((question as any).answerOptions ?? [], answer.answer);
      const correctIdx = findMatchingOptionIndex((question as any).answerOptions ?? [], question.correctAnswer);
      const isCorrect = (correctIdx !== -1 && submittedIdx !== -1)
        ? correctIdx === submittedIdx
        : normalizeAnswer(question.correctAnswer) === normalizeAnswer(answer.answer);
      maxRawScore += question.skor;
      if (isCorrect) {
        totalRawScore += question.skor;
        totalBenar++;
      } else {
        totalSalah++;
      }

      // Log answer
      await prisma.studentAnswerLog.create({
        data: {
          siswaId: siswaId,
          modulId: modulId,
          questionSource: 'POSTTEST',
          questionId: answer.questionId,
          isCorrect: isCorrect,
        },
      });
    }
  }

  // Normalize to 0-100 scale (matching calculatePretestScoreService)
  const normalizedScore =
    maxRawScore > 0 ? Math.round((totalRawScore / maxRawScore) * 100) : 0;

  // Update progress skor posttest dan kunci agar tidak bisa diulang
  await prisma.progress.updateMany({
    where: { siswaId: siswaId, modulId: modulId },
    data: {
      posttestScore: normalizedScore,
      posttestCorrectCount: totalBenar,
      posttestWrongCount: totalSalah,
      posttestTimeSpent: timeSpent ?? null,
      posttestCompleted: true,
    },
  });

  // Sync summary (sets isGraduated based on finalScore)
  await bktService.syncModuleProgressSummary(siswaId, modulId);

  // Add posttest to completedContentItems + enforce posttest access rules atomically
  const posttestRules = await prisma.automaticAccessMatery.findMany({
    where: { posttestId: posttest.id },
    select: { minScore: true, selectedTopics: { select: { id: true } } },
  });

  await prisma.$transaction(async (tx: any) => {
    const progressRecord = await lockProgressRow(tx, siswaId, modulId);
    if (!progressRecord) return;

    const posttestCompletedItems = parseCompletedEntries(progressRecord.completedContentItems);
    let mutated = false;

    const pushItems = (itemIds: string[], itemType: string) => {
      for (const id of itemIds) {
        if (!posttestCompletedItems.some((e) => e.itemId === id)) {
          posttestCompletedItems.push({ itemId: id, itemType, completedAt: new Date().toISOString() });
          mutated = true;
        }
      }
    };

    if (!posttestCompletedItems.some((e) => e.itemId === 'posttest')) {
      posttestCompletedItems.push({ itemId: 'posttest', itemType: 'POSTTEST', completedAt: new Date().toISOString() });
      mutated = true;
    }

    for (const rule of posttestRules) {
      if (normalizedScore < rule.minScore) continue;
      const targetTopicIds = rule.selectedTopics.map((t: any) => t.id);
      if (targetTopicIds.length === 0) continue;
      const targetTopikItems = await tx.topikItem.findMany({
        where: { topikId: { in: targetTopicIds } },
        select: { itemId: true, itemType: true },
      });
      const targetQuizzes = await tx.quiz.findMany({
        where: { topikId: { in: targetTopicIds } },
        select: { id: true },
      });
      pushItems(
        targetTopikItems
          .filter((ti: any) => ti.itemType === 'MATERI' || ti.itemType === 'RANGKUMAN_TOPIK')
          .map((ti: any) => ti.itemId),
        'MATERI',
      );
      pushItems(targetQuizzes.map((q: any) => q.id), 'QUIZ');
    }

    if (mutated) {
      const steps = await getSequenceSteps(modulId);
      const progressPercentage = progressPercentageFor(
        { ...progressRecord, completedContentItems: JSON.stringify(posttestCompletedItems) },
        steps,
      );
      await tx.progress.updateMany({
        where: { siswaId, modulId },
        data: { completedContentItems: JSON.stringify(posttestCompletedItems), progressPercentage },
      });
    }
  });

  const updatedProg = await prisma.progress.findUnique({
    where: { siswaId_modulId: { siswaId, modulId } },
    select: { isGraduated: true },
  });

  return { score: normalizedScore, totalBenar, totalSalah, isGraduated: updatedProg?.isGraduated ?? false };
};

export interface ClaimResult {
  certificate: {
    id: string;
    kode_sertif: string;
    certificateUrl: string;
    issued_at: Date;
  };
  status: 'claimed' | 'already_claimed';
}

/**
 * Generate certificate jika syarat terpenuhi (auto-claim).
 * Menggunakan transaction agar atomic.
 */
export const generateCertificateIfEligibleService = async (
  siswaId: string,
  modulId: string,
): Promise<ClaimResult | null> => {
  return prisma.$transaction(async (tx: any) => {
    const progress = await tx.progress.findUnique({
      where: { siswaId_modulId: { siswaId: siswaId, modulId: modulId } },
      include: { modul: true },
    });

    if (!progress || (!progress.isGraduated && !progress.posttestCompleted)) return null;
    if (!progress.modul.hasCertificate) return null;

    const existingCert = await tx.certificate.findFirst({
      where: { siswaId: siswaId, modulId: modulId },
    });

    if (existingCert) {
      return {
        certificate: {
          id: existingCert.id,
          kode_sertif: existingCert.kode_sertif,
          certificateUrl: existingCert.certificateUrl,
          issued_at: existingCert.issued_at,
        },
        status: 'already_claimed',
      } satisfies ClaimResult;
    }

    const certificateCode = `CERT-${siswaId.slice(-4)}-${modulId.slice(-4)}-${Date.now()}`;

    let certificate;
    try {
      certificate = await tx.certificate.create({
        data: {
          siswaId: siswaId,
          modulId: modulId,
          kode_sertif: certificateCode,
          certificateUrl: `https://storage.example.com/certificates/${certificateCode}.pdf`,
        },
      });
    } catch (err: any) {
      // P2002 = unique constraint violation — concurrent claim race, treat as already_claimed
      if (err?.code === 'P2002') {
        const existing = await tx.certificate.findFirst({ where: { siswaId, modulId } });
        if (existing) {
          return {
            certificate: { id: existing.id, kode_sertif: existing.kode_sertif, certificateUrl: existing.certificateUrl, issued_at: existing.issued_at },
            status: 'already_claimed',
          } satisfies ClaimResult;
        }
      }
      throw err;
    }

    try {
      await pushNotification(
        siswaId,
        'certificate',
        'Sertifikat Terbit',
        `Selamat! Sertifikat untuk modul "${progress.modul.moduleName}" telah terbit.`,
        { modulId, certificateCode },
      );
    } catch (err) {
      console.error('[CERTIFICATE] Gagal mengirim notifikasi realtime:', err);
    }

    return {
      certificate: {
        id: certificate.id,
        kode_sertif: certificate.kode_sertif,
        certificateUrl: certificate.certificateUrl,
        issued_at: certificate.issued_at,
      },
      status: 'claimed',
    } satisfies ClaimResult;
  });
};

export class ProgressService {
  initializeProgress = initializeProgressService;
  getProgressByModule = getProgressByModuleService;
  getAllProgressForSiswa = getAllProgressForSiswaService;
  updateLastAccessed = updateLastAccessedService;
  markMateriCompleted = markMateriCompletedService;
  markItemCompleted = markItemCompletedService;
  isMateriCompleted = isMateriCompletedService;
  calculatePretestScore = calculatePretestScoreService;
  calculatePosttestScore = calculatePosttestScoreService;
  generateCertificateIfEligible = generateCertificateIfEligibleService;
}