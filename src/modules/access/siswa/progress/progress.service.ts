import { prisma } from '../../../../lib/prisma';
import * as bktService from '../learning/bkt/bkt.service';
import {
  buildCursorPaginatedResponse,
  buildCursorWhere,
  decodeCursor,
} from '../../../../utils/pagination';
import { pushNotification } from '../../../../utils/realtime';

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

  return buildCursorPaginatedResponse(progresses, limit, (item) => ({
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

  const progress = await prisma.progress.findUnique({
    where: { siswaId_modulId: { siswaId, modulId } },
  });

  if (!progress) throw new Error('Progress tidak ditemukan');

  const completedItems: Array<{ itemId: string; itemType: string; completedAt: string }> = (() => {
    try {
      return JSON.parse(progress.completedContentItems || '[]');
    } catch {
      return [];
    }
  })();

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
      const quizRecord = await prisma.quiz.findUnique({
        where: { id: itemId },
        select: { quizGroupId: true },
      });
      if (quizRecord?.quizGroupId) {
        const siblingQuizzes = await prisma.quiz.findMany({
          where: { quizGroupId: quizRecord.quizGroupId, id: { not: itemId } },
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

  const totalSequenceSteps = await getTotalSequenceSteps(modulId);
  const completedCount = completedItems.length;
  const progressPercentage = totalSequenceSteps > 0
    ? Math.min(100, Math.round((completedCount / totalSequenceSteps) * 100))
    : 0;

  await prisma.progress.update({
    where: { id: progress.id },
    data: {
      completedContentItems: JSON.stringify(completedItems),
      progressPercentage,
    },
  });

  await bktService.syncModuleProgressSummary(siswaId, modulId);

  const updatedProgress = await prisma.progress.findUnique({
    where: { id: progress.id },
    include: { modul: true },
  });

  return { message: 'Item berhasil ditandai selesai.', progress: updatedProgress };
};

/**
 * Hitung total langkah dalam sequence (digunakan untuk progress percentage).
 */
async function getTotalSequenceSteps(modulId: string): Promise<number> {
  const modul = await prisma.modul.findUnique({
    where: { id: modulId },
    include: {
      topiks: {
        include: {
          topikItems: true,
          quizzes: { select: { id: true, quizGroupId: true } },
          quizGroups: { select: { id: true } },
        },
      },
      pretest: true,
      posttest: true,
    },
  });

  if (!modul) return 1;

  let count = 0;

  if (modul.pretest) count += 1;

  // Track quiz groups to count each group as 1 step
  const countedQuizGroups = new Set<string>();

  for (const topik of modul.topiks) {
    for (const ti of topik.topikItems) {
      if (ti.itemType === 'MATERI' || ti.itemType === 'RANGKUMAN_TOPIK') {
        count += 1;
      } else if (ti.itemType === 'QUIZ') {
        const quiz = topik.quizzes.find((q: any) => q.id === ti.itemId);
        if (quiz?.quizGroupId) {
          if (!countedQuizGroups.has(quiz.quizGroupId)) {
            countedQuizGroups.add(quiz.quizGroupId);
            count += 1;
          }
        } else {
          count += 1;
        }
      }
    }
  }

  if (modul.rangkumanAkhir) count += 1;

  if (modul.posttest) count += 1;

  return Math.max(count, 1);
}

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
    include: { pretestQuestions: true, pretestSettings: true },
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
      (item) => item.id === answer.questionId,
    );
    if (question) {
      const isCorrect = question.correctAnswer === answer.answer;
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

  // Read completedContentItems once for both unlock paths
  const progressRecord = await prisma.progress.findUnique({
    where: { siswaId_modulId: { siswaId, modulId } },
    select: { completedContentItems: true },
  });
  const completedItems: Array<{ itemId: string; itemType: string; completedAt: string }> = (() => {
    try {
      const parsed = JSON.parse(progressRecord?.completedContentItems || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const existingIds = new Set(completedItems.map((e) => e.itemId));
  let unlockedCount = 0;
  let changed = false;

  // Rule-based unlock: AutomaticAccessMatery (specific materis per score threshold)
  const accessRules = await prisma.automaticAccessMatery.findMany({
    where: { pretestId: pretest.id },
    select: { materiId: true, minScore: true },
  });
  for (const rule of accessRules) {
    if (totalScore >= rule.minScore && !existingIds.has(rule.materiId)) {
      completedItems.push({ itemId: rule.materiId, itemType: 'MATERI', completedAt: new Date().toISOString() });
      existingIds.add(rule.materiId);
      unlockedCount++;
      changed = true;
    }
  }

  // Formula-based sequential unlock: first N materis in topic/item order
  const totalMateris = await prisma.materi.count({ where: { topik: { modulId } } });
  const formulaCount = totalMateris > 0 ? Math.max(Math.floor(totalMateris * totalScore / 100), 1) : 0;
  if (formulaCount > 0) {
    const orderedTopikItems = await prisma.topikItem.findMany({
      where: { topik: { modulId }, itemType: 'MATERI' },
      select: { itemId: true },
      orderBy: [{ topik: { createdAt: 'asc' } }, { orderNumber: 'asc' }],
      take: formulaCount,
    });
    for (const ti of orderedTopikItems) {
      if (!existingIds.has(ti.itemId)) {
        completedItems.push({ itemId: ti.itemId, itemType: 'MATERI', completedAt: new Date().toISOString() });
        existingIds.add(ti.itemId);
        unlockedCount++;
        changed = true;
      }
    }
  }

  if (changed) {
    const totalSequenceSteps = await getTotalSequenceSteps(modulId);
    const progressPercentage = totalSequenceSteps > 0
      ? Math.min(100, Math.round((completedItems.length / totalSequenceSteps) * 100))
      : 0;
    await prisma.progress.updateMany({
      where: { siswaId, modulId },
      data: { completedContentItems: JSON.stringify(completedItems), progressPercentage },
    });
  }

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
    include: { soals: true, posttestSettings: true },
  });

  if (!posttest) throw new Error('Posttest tidak ditemukan');

  // Initialize progress
  await initializeProgressService(siswaId, modulId);

  let totalRawScore = 0;
  let maxRawScore = 0;
  let totalBenar = 0;
  let totalSalah = 0;

  for (const answer of answers) {
    const question = posttest.soals.find(
      (item) => item.id === answer.questionId,
    );
    if (question) {
      const isCorrect = question.correctAnswer === answer.answer;
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

  // Add posttest to completedContentItems
  const posttestProgress = await prisma.progress.findUnique({
    where: { siswaId_modulId: { siswaId, modulId } },
    select: { completedContentItems: true },
  });
  const posttestCompletedItems: Array<{ itemId: string; itemType: string; completedAt: string }> = (() => {
    try {
      const parsed = JSON.parse(posttestProgress?.completedContentItems || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  if (!posttestCompletedItems.some((e) => e.itemId === 'posttest')) {
    posttestCompletedItems.push({ itemId: 'posttest', itemType: 'POSTTEST', completedAt: new Date().toISOString() });
    const totalSequenceSteps = await getTotalSequenceSteps(modulId);
    const progressPercentage = totalSequenceSteps > 0 ? Math.min(100, Math.round((posttestCompletedItems.length / totalSequenceSteps) * 100)) : 0;
    await prisma.progress.updateMany({
      where: { siswaId, modulId },
      data: { completedContentItems: JSON.stringify(posttestCompletedItems), progressPercentage },
    });
  }

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
  return prisma.$transaction(async (tx) => {
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

    await pushNotification(
      siswaId,
      'certificate',
      'Sertifikat Terbit',
      `Selamat! Sertifikat untuk modul "${progress.modul.moduleName}" telah terbit.`,
      { modulId, certificateCode },
    );

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