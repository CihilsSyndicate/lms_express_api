import { AppError } from '@/errors/app.error';
import { prisma } from '@/lib/prisma';
import { ProgressService } from '@/modules/access/siswa/progress/progress.service';
import { calculateUnlockedCount } from './pretestUnlock';
import {
  buildCursorPaginatedResponse,
  buildCursorWhere,
  decodeCursor,
} from './pagination';

type TestAnswer = { questionId: string; answer: string };

const progressService = new ProgressService();

/**
 * Domain/Business Logic Functions for Pretest
 * These functions contain business rules, data validation, and orchestration.
 */

export const createPretestRecord = async (
  modulId: string,
  tutorId?: string,
  settings?: { duration: number; countShownQuestions: number },
  adminBypass?: boolean,
) => {
  if (!tutorId) {
    throw new AppError(401, 'Akses ditolak.');
  }

  const modul = await prisma.modul.findUnique({
    where: { id: modulId },
  });

  if (!modul) {
    throw new AppError(404, 'Modul tidak ditemukan.');
  }

  if (!adminBypass && modul.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak membuat pretest untuk modul ini.',
    );
  }

  const newPretest = await prisma.pretest.create({
    data: { pretestName: `Pretest ${modul.moduleName}` },
  });

  await prisma.modul.update({
    where: { id: modulId },
    data: { pretestId: newPretest.id },
  });

  if (settings) {
    await prisma.pretestSetting.create({
      data: {
        pretestId: newPretest.id,
        duration: settings.duration,
        countShownQuestions: settings.countShownQuestions,
      },
    });
  }

  const roleLabel = adminBypass ? 'Admin' : 'Tutor';
  console.log(
    `[PRETEST] Pretest baru dibuat oleh ${roleLabel} ${tutorId}: ${newPretest.id}`,
  );

  return prisma.pretest.findUnique({
    where: { id: newPretest.id },
    include: { pretestSettings: true },
  });
};

export const addPretestQuestion = async (
  payload: {
    pretest_id: string;
    pertanyaan: string;
    pilihan: string[];
    jawaban_benar: string;
    skor?: number;
  },
  tutorId?: string,
  adminBypass?: boolean,
) => {
  const pretest = await prisma.pretest.findUnique({
    where: { id: payload.pretest_id },
    include: { modul: true },
  });

  if (!pretest) {
    throw new AppError(404, 'Pretest tidak ditemukan.');
  }

  if (!adminBypass && pretest?.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  const newSoal = await prisma.soalPretest.create({
    data: {
      pretestId: payload.pretest_id,
      pertanyaan: payload.pertanyaan,
      answerOptions: {
        create: payload.pilihan.map((option) => ({ option })),
      },
      correctAnswer: payload.jawaban_benar,
      skor: payload.skor ?? 10,
    },
  });

  console.log(`[PRETEST] Soal pretest ditambah: ${newSoal.id}`);

  return newSoal;
};

export const getPretestQuestions = async (modulId: string) => {
  const pretest = await prisma.pretest.findFirst({
    where: { modul: { id: modulId } },
    include: {
      pretestQuestions: { include: { answerOptions: true } },
      pretestSettings: true,
    },
  });

  if (!pretest) {
    throw new AppError(404, 'Pretest tidak ditemukan.');
  }

  return pretest;
};

export const submitPretestAnswer = async (
  modulId: string,
  answers: TestAnswer[],
  siswaId?: string,
  role?: string,
  timeSpent?: number,
) => {
  if (role !== 'siswa') {
    throw new AppError(403, 'Hanya siswa yang bisa submit pretest.');
  }

  const { score, totalBenar, totalSalah } = await progressService.calculatePretestScore(
    siswaId as string,
    modulId,
    answers,
    timeSpent,
  );

  const { unlocked_count, total_submodules } = await prisma.$transaction(
    async (tx) => {
      const totalSubmodules = await tx.materi.count({
        where: { topik: { modulId } },
      });

      const unlockedCount = calculateUnlockedCount(totalSubmodules, score);

      const progressPercentage =
        totalSubmodules > 0
          ? Math.round((unlockedCount / totalSubmodules) * 100)
          : 0;

      await tx.progress.updateMany({
        where: { siswaId: siswaId as string, modulId: modulId as string },
        data: {
          status: 'IN_PROGRESS',
          progressPercentage,
        },
      });

      return {
        unlocked_count: unlockedCount,
        total_submodules: totalSubmodules,
      };
    },
  );

  return { score, unlocked_count, total_submodules, totalBenar, totalSalah };
};

export const getAllPretest = async (
  tutorId: string,
  limit: number = 10,
  cursor?: string,
) => {
  const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
  const where = buildCursorWhere(cursorPayload);

  const pretests = await prisma.pretest.findMany({
    where: {
      ...where,
      modul: { tutorId },
    },
    take: limit + 1,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: {
      pretestSettings: true,
      _count: { select: { pretestQuestions: true } },
    },
  });

  return buildCursorPaginatedResponse(pretests, limit, (item) => ({
    createdAt: item.createdAt,
    id: item.id,
  }));
};

export const getAllPretestAdmin = async (
  limit: number = 10,
  cursor?: string,
) => {
  const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
  const where = buildCursorWhere(cursorPayload);

  const pretests = await prisma.pretest.findMany({
    where,
    take: limit + 1,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: {
      pretestSettings: true,
      _count: { select: { pretestQuestions: true } },
    },
  });

  return buildCursorPaginatedResponse(pretests, limit, (item) => ({
    createdAt: item.createdAt,
    id: item.id,
  }));
};

export const getPretestById = async (
  pretestId: string,
  tutorId?: string,
) => {
  const pretest = await prisma.pretest.findUnique({
    where: { id: pretestId },
    include: {
      pretestQuestions: { include: { answerOptions: true } },
      pretestSettings: true,
      modul: true,
    },
  });

  if (!pretest) {
    throw new AppError(404, 'Pretest tidak ditemukan.');
  }

  if (tutorId && pretest.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  return pretest;
};

export const updatePretestRecord = async (
  pretestId: string,
  data: { pretestName?: string },
  tutorId?: string,
) => {
  const pretest = await prisma.pretest.findUnique({
    where: { id: pretestId },
    include: { modul: true },
  });

  if (!pretest) {
    throw new AppError(404, 'Pretest tidak ditemukan.');
  }

  if (tutorId && pretest.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  const updated = await prisma.pretest.update({
    where: { id: pretestId },
    data,
  });

  console.log(`[PRETEST] Pretest diupdate: ${pretestId}`);

  return updated;
};

export const deletePretestRecord = async (
  pretestId: string,
  tutorId?: string,
) => {
  const pretest = await prisma.pretest.findUnique({
    where: { id: pretestId },
    include: { modul: true },
  });

  if (!pretest) {
    throw new AppError(404, 'Pretest tidak ditemukan.');
  }

  if (tutorId && pretest.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  await prisma.pretest.delete({ where: { id: pretestId } });

  console.log(`[PRETEST] Pretest dihapus: ${pretestId}`);

  return { message: 'Pretest berhasil dihapus.' };
};

export const updatePretestQuestion = async (
  soalId: string,
  data: {
    pertanyaan?: string;
    pilihan?: string[];
    jawaban_benar?: string;
    skor?: number;
  },
  tutorId?: string,
) => {
  const soal = await prisma.soalPretest.findUnique({
    where: { id: soalId },
    include: { pretest: { include: { modul: true } } },
  });

  if (!soal) {
    throw new AppError(404, 'Soal pretest tidak ditemukan.');
  }

  if (tutorId && soal.pretest.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  const updateData: any = {};
  if (data.pertanyaan !== undefined) updateData.pertanyaan = data.pertanyaan;
  if (data.jawaban_benar !== undefined) updateData.correctAnswer = data.jawaban_benar;
  if (data.skor !== undefined) updateData.skor = data.skor;

  const updated = await prisma.$transaction(async (tx) => {
    if (data.pilihan) {
      await tx.pretestAnswerOptions.deleteMany({ where: { soalPretestId: soalId } });
      await tx.pretestAnswerOptions.createMany({
        data: data.pilihan.map((option) => ({
          soalPretestId: soalId,
          option,
        })),
      });
    }

    return tx.soalPretest.update({
      where: { id: soalId },
      data: updateData,
      include: { answerOptions: true },
    });
  });

  console.log(`[PRETEST] Soal pretest diupdate: ${soalId}`);

  return updated;
};

export const deletePretestQuestion = async (
  soalId: string,
  tutorId?: string,
) => {
  const soal = await prisma.soalPretest.findUnique({
    where: { id: soalId },
    include: { pretest: { include: { modul: true } } },
  });

  if (!soal) {
    throw new AppError(404, 'Soal pretest tidak ditemukan.');
  }

  if (tutorId && soal.pretest.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  await prisma.soalPretest.delete({ where: { id: soalId } });

  console.log(`[PRETEST] Soal pretest dihapus: ${soalId}`);

  return { message: 'Soal pretest berhasil dihapus.' };
};

export const upsertPretestSettings = async (
  pretestId: string,
  data: { duration: number; countShownQuestions: number },
  tutorId?: string,
) => {
  const pretest = await prisma.pretest.findUnique({
    where: { id: pretestId },
    include: { modul: true },
  });

  if (!pretest) {
    throw new AppError(404, 'Pretest tidak ditemukan.');
  }

  if (tutorId && pretest.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  const existing = await prisma.pretestSetting.findFirst({
    where: { pretestId },
  });

  if (existing) {
    return prisma.pretestSetting.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.pretestSetting.create({
    data: {
      pretestId,
      duration: data.duration,
      countShownQuestions: data.countShownQuestions,
    },
  });
};
