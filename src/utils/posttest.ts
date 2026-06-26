import { AppError } from '@/errors/app.error';
import { prisma } from '@/lib/prisma';
import { ProgressService } from '@/modules/access/siswa/progress/progress.service';
import {
  buildCursorPaginatedResponse,
  buildCursorWhere,
  decodeCursor,
} from './pagination';

type TestAnswer = { questionId: string; answer: string };

const progressService = new ProgressService();

/**
 * Domain/Business Logic Functions for Posttest
 * These functions contain business rules, data validation, and orchestration.
 */

export const createPosttestRecord = async (
  modulId: string,
  tutorId?: string,
  adminBypass?: boolean,
) => {
  if (!tutorId) {
    throw new AppError(401, 'Akses ditolak.');
  }

  const modul = await prisma.modul.findFirst({
    where: { id: modulId },
  });

  if (!modul) {
    throw new AppError(404, 'Modul tidak ditemukan.');
  }

  if (!adminBypass && modul.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak membuat posttest untuk modul ini.',
    );
  }

  const newPosttest = await prisma.posttest.create({
    data: { modul: { connect: { id: modulId } } },
  });

  await prisma.modul.update({
    where: { id: modulId },
    data: { posttestId: newPosttest.id },
  });

  const roleLabel = adminBypass ? 'Admin' : 'Tutor';
  console.log(
    `[POSTTEST] Posttest baru dibuat oleh ${roleLabel} ${tutorId}: ${newPosttest.id}`,
  );

  return newPosttest;
};

export const addPosttestQuestion = async (
  payload: {
    posttest_id: string;
    pertanyaan: string;
    pilihan: any;
    jawaban_benar: string;
    skor?: number;
    ctGroupId?: string;
    ctStory?: string;
    ctAspect?: string;
  },
  tutorId?: string,
  adminBypass?: boolean,
) => {
  const posttest = await prisma.posttest.findUnique({
    where: { id: payload.posttest_id },
    include: { modul: true },
  });

  if (!posttest) {
    throw new AppError(404, 'Posttest tidak ditemukan.');
  }

  if (!adminBypass && posttest?.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  const newSoal = await prisma.soalPosttest.create({
    data: {
      posttestId: payload.posttest_id,
      question: payload.pertanyaan,
      pilihan: payload.pilihan,
      correctAnswer: payload.jawaban_benar,
      skor: payload.skor ?? 10,
      ctGroupId: payload.ctGroupId,
      ctStory: payload.ctStory,
      ctAspect: payload.ctAspect,
    },
  });

  console.log(`[POSTTEST] Soal posttest ditambah: ${newSoal.id}`);

  return newSoal;
};

export const getPosttestQuestions = async (modulId: string) => {
  const posttest = await prisma.posttest.findFirst({
    where: { modul: { id: modulId } },
    include: { soals: true, posttestSettings: true },
  });

  if (!posttest) {
    throw new AppError(404, 'Posttest tidak ditemukan.');
  }

  return posttest;
};

export const submitPosttestAnswer = async (
  modulId: string,
  answers: TestAnswer[],
  siswaId?: string,
  role?: string,
  timeSpent?: number,
) => {
  if (role !== 'siswa') {
    throw new AppError(403, 'Hanya siswa yang bisa submit posttest.');
  }

  const { score, totalBenar, totalSalah, isGraduated } = await progressService.calculatePosttestScore(
    siswaId as string,
    modulId,
    answers,
    timeSpent,
  );

  const certificate = await prisma.$transaction(async (tx) => {
    return progressService.generateCertificateIfEligible(
      siswaId as string,
      modulId,
    );
  });

  return { score, certificate, totalBenar, totalSalah, isGraduated };
};

export const getAllPosttest = async (
  tutorId: string,
  limit: number = 10,
  cursor?: string,
) => {
  const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
  const where = buildCursorWhere(cursorPayload);

  const posttests = await prisma.posttest.findMany({
    where: {
      ...where,
      modul: { tutorId },
    },
    take: limit + 1,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: {
      _count: { select: { soals: true } },
    },
  });

  return buildCursorPaginatedResponse(posttests, limit, (item) => ({
    createdAt: item.createdAt,
    id: item.id,
  }));
};

export const getAllPosttestAdmin = async (
  limit: number = 10,
  cursor?: string,
) => {
  const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
  const where = buildCursorWhere(cursorPayload);

  const posttests = await prisma.posttest.findMany({
    where,
    take: limit + 1,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: {
      _count: { select: { soals: true } },
    },
  });

  return buildCursorPaginatedResponse(posttests, limit, (item) => ({
    createdAt: item.createdAt,
    id: item.id,
  }));
};

export const getPosttestById = async (
  posttestId: string,
  tutorId?: string,
) => {
  const posttest = await prisma.posttest.findUnique({
    where: { id: posttestId },
    include: { soals: true, modul: true, posttestSettings: true },
  });

  if (!posttest) {
    throw new AppError(404, 'Posttest tidak ditemukan.');
  }

  if (tutorId && posttest.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  return posttest;
};

export const updatePosttestRecord = async (
  posttestId: string,
  data: Record<string, any>,
  tutorId?: string,
) => {
  const posttest = await prisma.posttest.findUnique({
    where: { id: posttestId },
    include: { modul: true },
  });

  if (!posttest) {
    throw new AppError(404, 'Posttest tidak ditemukan.');
  }

  if (tutorId && posttest.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  const updated = await prisma.posttest.update({
    where: { id: posttestId },
    data,
  });

  console.log(`[POSTTEST] Posttest diupdate: ${posttestId}`);

  return updated;
};

export const deletePosttestRecord = async (
  posttestId: string,
  tutorId?: string,
) => {
  const posttest = await prisma.posttest.findUnique({
    where: { id: posttestId },
    include: { modul: true },
  });

  if (!posttest) {
    throw new AppError(404, 'Posttest tidak ditemukan.');
  }

  if (tutorId && posttest.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  await prisma.posttest.delete({ where: { id: posttestId } });

  console.log(`[POSTTEST] Posttest dihapus: ${posttestId}`);

  return { message: 'Posttest berhasil dihapus.' };
};

export const updatePosttestQuestion = async (
  soalId: string,
  data: {
    pertanyaan?: string;
    pilihan?: any;
    jawaban_benar?: string;
    skor?: number;
    ctGroupId?: string;
    ctStory?: string;
    ctAspect?: string;
  },
  tutorId?: string,
) => {
  const soal = await prisma.soalPosttest.findUnique({
    where: { id: soalId },
    include: { posttest: { include: { modul: true } } },
  });

  if (!soal) {
    throw new AppError(404, 'Soal posttest tidak ditemukan.');
  }

  if (tutorId && soal.posttest.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  const updateData: any = {};
  if (data.pertanyaan !== undefined) updateData.question = data.pertanyaan;
  if (data.pilihan !== undefined) updateData.pilihan = data.pilihan;
  if (data.jawaban_benar !== undefined) updateData.correctAnswer = data.jawaban_benar;
  if (data.skor !== undefined) updateData.skor = data.skor;
  if (data.ctGroupId !== undefined) updateData.ctGroupId = data.ctGroupId;
  if (data.ctStory !== undefined) updateData.ctStory = data.ctStory;
  if (data.ctAspect !== undefined) updateData.ctAspect = data.ctAspect;

  const updated = await prisma.soalPosttest.update({
    where: { id: soalId },
    data: updateData,
  });

  console.log(`[POSTTEST] Soal posttest diupdate: ${soalId}`);

  return updated;
};

export const deletePosttestQuestion = async (
  soalId: string,
  tutorId?: string,
) => {
  const soal = await prisma.soalPosttest.findUnique({
    where: { id: soalId },
    include: { posttest: { include: { modul: true } } },
  });

  if (!soal) {
    throw new AppError(404, 'Soal posttest tidak ditemukan.');
  }

  if (tutorId && soal.posttest.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  await prisma.soalPosttest.delete({ where: { id: soalId } });

  console.log(`[POSTTEST] Soal posttest dihapus: ${soalId}`);

  return { message: 'Soal posttest berhasil dihapus.' };
};

export const upsertPosttestSettings = async (
  posttestId: string,
  data: { duration: number; countShownQuestions?: number },
  tutorId?: string,
) => {
  const posttest = await prisma.posttest.findUnique({
    where: { id: posttestId },
    include: { modul: true },
  });
  if (!posttest) throw new AppError(404, 'Posttest tidak ditemukan.');
  if (tutorId && posttest.modul?.tutorId !== tutorId) throw new AppError(403, 'Akses ditolak.');

  const existing = await prisma.posttestSetting.findFirst({ where: { posttestId } });
  if (existing) {
    return prisma.posttestSetting.update({ where: { id: existing.id }, data });
  }
  return prisma.posttestSetting.create({
    data: { posttestId, duration: data.duration, countShownQuestions: data.countShownQuestions ?? 0 },
  });
};

export const deleteAllPosttestQuestions = async (
  posttestId: string,
  tutorId?: string,
) => {
  const posttest = await prisma.posttest.findUnique({
    where: { id: posttestId },
    include: { modul: true },
  });
  if (!posttest) throw new AppError(404, 'Posttest tidak ditemukan.');
  if (tutorId && posttest.modul?.tutorId !== tutorId) throw new AppError(403, 'Akses ditolak.');

  await prisma.soalPosttest.deleteMany({ where: { posttestId } });

  console.log(`[POSTTEST] Semua soal posttest dihapus: ${posttestId}`);
};
