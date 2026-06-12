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

  // console.log(progress);
  // if (progress) {
  //   await pushNotification(
  //     siswaId,
  //     'progress',
  //     'Progres Modul',
  //     `Progres Anda "${progress.modul?.moduleName}" mencapai ${progress.progressPercentage.toFixed(0)}%.`,
  //     { modulId, progressPercentage: progress.progressPercentage },
  //   );
  // }

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
      topiks: { include: { topikItems: true } },
      pretest: true,
      posttest: true,
    },
  });

  if (!modul) return 1;

  let count = 0;

  if (modul.pretest) count += 1;

  for (const topik of modul.topiks) {
    for (const ti of topik.topikItems) {
      // RANGKUMAN_TOPIK items are handled client-side only and never submitted
      if (ti.itemType === 'MATERI' || ti.itemType === 'QUIZ') {
        count += 1;
      }
    }
    // topik rangkuman (summary) is client-side only — not submitted
  }

  // rangkumanAkhir is client-side only — not submitted

  if (modul.posttest) count += 1;

  count += 1; // rating
  if (modul.hasCertificate) count += 1;

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
 * Hitung skor pretest.
 */
export const calculatePretestScoreService = async (
  siswaId: string,
  modulId: string,
  answers: { questionId: string; answer: string }[],
  timeSpent?: number,
): Promise<{ score: number; totalBenar: number; totalSalah: number }> => {
  const pretest = await prisma.pretest.findFirst({
    where: {
      modul: {
        id: modulId,
      },
    },
    include: { pretestQuestions: true, pretestSettings: true },
  });

  if (!pretest) return { score: 0, totalBenar: 0, totalSalah: 0 };

  // Server-side time validation — reject submissions that exceed duration + 30s
  const setting = pretest.pretestSettings?.[0];
  if (setting && timeSpent != null && timeSpent > setting.duration + 30) {
    throw new Error('Waktu pengerjaan telah habis');
  }

  let totalRawScore = 0;
  let maxRawScore = 0;
  let totalBenar = 0;
  let totalSalah = 0;
  const answerLogs: { questionId: string; isCorrect: boolean }[] = [];

  for (const answer of answers) {
    const question = pretest.pretestQuestions.find(
      (item) => item.id === answer.questionId,
    );
    if (question) {
      const isCorrect = question.correctAnswer === answer.answer;
      // accumulate raw scores
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

  // Update progress skor pretest
  await prisma.progress.updateMany({
    where: { siswaId: siswaId, modulId: modulId },
    data: {
      pretestScore: totalScore,
      pretestCorrectCount: totalBenar,
      pretestWrongCount: totalSalah,
      pretestTimeSpent: timeSpent ?? null,
    },
  });

  // Initialize BKT
  await bktService.initializeKnowledgeStateFromPretest(
    siswaId,
    modulId,
    answerLogs,
  );

  return { score: totalScore, totalBenar, totalSalah };
};

/**
 * Hitung skor posttest.
 */
export const calculatePosttestScoreService = async (
  siswaId: string,
  modulId: string,
  answers: { questionId: string; answer: string }[],
  timeSpent?: number,
): Promise<{ score: number; totalBenar: number; totalSalah: number }> => {
  const posttest = await prisma.posttest.findFirst({
    where: { modul: { id: modulId } },
    include: { soals: true },
  });

  if (!posttest) return { score: 0, totalBenar: 0, totalSalah: 0 };

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

  // Update progress skor posttest
  await prisma.progress.updateMany({
    where: { siswaId: siswaId, modulId: modulId },
    data: {
      posttestScore: normalizedScore,
      posttestCorrectCount: totalBenar,
      posttestWrongCount: totalSalah,
      posttestTimeSpent: timeSpent ?? null,
    },
  });

  // Sync summary
  await bktService.syncModuleProgressSummary(siswaId, modulId);

  return { score: normalizedScore, totalBenar, totalSalah };
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

    if (!progress || !progress.isGraduated) return null;
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

    const certificate = await tx.certificate.create({
      data: {
        siswaId: siswaId,
        modulId: modulId,
        kode_sertif: certificateCode,
        certificateUrl: `https://storage.example.com/certificates/${certificateCode}.pdf`,
      },
    });

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
