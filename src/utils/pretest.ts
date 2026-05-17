import { AppError } from '@/errors/app.error';
import { prisma } from '@/lib/prisma';
import { ProgressService } from '@/modules/access/siswa/progress/progress.service';

type TestAnswer = { questionId: string; answer: string };

const progressService = new ProgressService();

/**
 * Domain/Business Logic Functions for Pretest
 * These functions contain business rules, data validation, and orchestration.
 */

export const createPretestRecord = async (
  modulId: string,
  tutorId?: string,
) => {
  if (!tutorId) {
    throw new AppError(401, 'Akses ditolak.');
  }

  const modul = await prisma.modul.findUnique({
    where: { id: modulId },
  });

  if (!modul || modul.tutorId !== tutorId) {
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

  console.log(
    `[PRETEST] Pretest baru dibuat oleh Tutor ${tutorId}: ${newPretest.id}`,
  );

  return newPretest;
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
) => {
  const pretest = await prisma.pretest.findUnique({
    where: { id: payload.pretest_id },
    include: { modul: true },
  });

  if (!pretest || pretest?.modul?.tutorId !== tutorId) {
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
    include: { pretestQuestions: { include: { answerOptions: true } } },
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
) => {
  if (role !== 'siswa') {
    throw new AppError(403, 'Hanya siswa yang bisa submit pretest.');
  }

  const score = await progressService.calculatePretestScore(
    siswaId as string,
    modulId,
    answers,
  );

  return { score };
};
