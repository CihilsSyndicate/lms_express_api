import { AppError } from '@/errors/app.error';
import { prisma } from '@/lib/prisma';
import { ProgressService } from '@/modules/access/siswa/progress/progress.service';

type TestAnswer = { questionId: string; answer: string };

const progressService = new ProgressService();

/**
 * Domain/Business Logic Functions for Posttest
 * These functions contain business rules, data validation, and orchestration.
 */

export const createPosttestRecord = async (
  modulId: string,
  tutorId?: string,
) => {
  if (!tutorId) {
    throw new AppError(401, 'Akses ditolak.');
  }

  const modul = await prisma.modul.findFirst({
    where: { id: modulId },
  });

  if (!modul || modul.tutor_id !== tutorId) {
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
    data: { posttest_id: newPosttest.id },
  });

  console.log(
    `[POSTTEST] Posttest baru dibuat oleh Tutor ${tutorId}: ${newPosttest.id}`,
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
  },
  tutorId?: string,
) => {
  const posttest = await prisma.posttest.findUnique({
    where: { id: payload.posttest_id },
    include: { modul: true },
  });

  if (!posttest || posttest?.modul?.tutor_id !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  const newSoal = await prisma.soalPosttest.create({
    data: {
      posttest_id: payload.posttest_id,
      pertanyaan: payload.pertanyaan,
      pilihan: payload.pilihan,
      jawaban_benar: payload.jawaban_benar,
      skor: payload.skor ?? 10,
    },
  });

  console.log(`[POSTTEST] Soal posttest ditambah: ${newSoal.id}`);

  return newSoal;
};

export const getPosttestQuestions = async (modulId: string) => {
  const posttest = await prisma.posttest.findFirst({
    where: { modul: { id: modulId } },
    include: { soals: true },
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
) => {
  if (role !== 'siswa') {
    throw new AppError(403, 'Hanya siswa yang bisa submit posttest.');
  }

  const score = await progressService.calculatePosttestScore(
    siswaId as string,
    modulId,
    answers,
  );

  const certificate = await progressService.generateCertificateIfEligible(
    siswaId as string,
    modulId,
  );

  return { score, certificate };
};
