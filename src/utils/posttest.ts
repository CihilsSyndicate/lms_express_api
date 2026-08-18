import { AppError } from '@/errors/app.error';
import { prisma } from '@/lib/prisma';
import { ProgressService } from '@/modules/access/siswa/progress/progress.service';
import { addPretestQuestion, updatePretestQuestion, deletePretestQuestion, deleteAllPretestQuestions } from './pretest';
import { buildCursorPaginatedResponse, buildCursorWhere, decodeCursor } from './pagination';

type TestAnswer = { questionId: string; answer: string };

const progressService = new ProgressService();

export const createPosttestRecord = async (modulId: string, tutorId?: string, adminBypass?: boolean) => {
  if (!tutorId) throw new AppError(401, 'Akses ditolak.');
  const modul = await prisma.modul.findFirst({ where: { id: modulId } });
  if (!modul) throw new AppError(404, 'Modul tidak ditemukan.');
  if (!adminBypass && modul.tutorId !== tutorId)
    throw new AppError(403, 'Akses ditolak. Anda tidak berhak membuat posttest untuk modul ini.');
  const newPosttest = await prisma.posttest.create({ data: { modul: { connect: { id: modulId } } } });
  await prisma.modul.update({ where: { id: modulId }, data: { posttestId: newPosttest.id } });
  console.log(`[POSTTEST] Posttest baru dibuat: ${newPosttest.id}`);
  return newPosttest;
};

export const addPosttestQuestion = async (
  payload: { posttest_id: string; pertanyaan: string; pilihan: any; jawaban_benar: string; skor?: number; questionNumber?: number | null; ctGroupId?: string; ctStory?: string; ctAspect?: string },
  tutorId?: string, adminBypass?: boolean
) => {
  const posttest = await prisma.posttest.findUnique({ where: { id: payload.posttest_id }, include: { modul: true } });
  if (!posttest) throw new AppError(404, 'Posttest tidak ditemukan.');
  if (!adminBypass && posttest.modul?.tutorId !== tutorId) throw new AppError(403, 'Akses ditolak.');
  const pretest = await prisma.pretest.findFirst({ where: { modul: { id: posttest.modul!.id } } });
  if (!pretest) throw new AppError(404, 'Pretest tidak ditemukan. Buat pretest terlebih dahulu.');
  const answerOptions = (Array.isArray(payload.pilihan) ? payload.pilihan : []).map((opt: string) => ({ option: opt }));
  const pretestPayload = Object.fromEntries(
    Object.entries({ pretest_id: pretest.id, pertanyaan: payload.pertanyaan, pilihan: payload.pilihan, jawaban_benar: payload.jawaban_benar, skor: payload.skor ?? 10, questionNumber: payload.questionNumber ?? null, ctGroupId: payload.ctGroupId, ctStory: payload.ctStory, ctAspect: payload.ctAspect }).filter(([_, v]) => v !== undefined)
  );
  const newSoal = await addPretestQuestion(
    pretestPayload as any,
    tutorId, adminBypass,
  );
  const existingSettings = await prisma.posttestSetting.findFirst({ where: { posttestId: payload.posttest_id } });
  if (!existingSettings) {
    await prisma.posttestSetting.create({ data: { posttestId: payload.posttest_id, duration: 90, countShownQuestions: 0 } });
  }
  console.log(`[POSTTEST] Soal posttest ditambah (via pretest): ${newSoal.id}`);
  return newSoal;
};

export const getPosttestQuestions = async (modulId: string) => {
  const posttest = await prisma.posttest.findFirst({ where: { modul: { id: modulId } }, include: { posttestSettings: true } });
  if (!posttest) throw new AppError(404, 'Posttest tidak ditemukan.');
  const pretest = await prisma.pretest.findFirst({
    where: { modul: { id: modulId } },
    include: { pretestQuestions: { include: { answerOptions: true }, orderBy: { questionNumber: { sort: 'asc', nulls: 'last' } } } },
  });
  const pretestQs = pretest?.pretestQuestions ?? [];
  // Transform to match old SoalPosttest format for frontend compatibility
  const soals = pretestQs.map((q: any) => ({
    id: q.id,
    posttestId: posttest.id,
    question: q.pertanyaan,
    pilihan: (q.answerOptions ?? []).map((o: any) => o.option),
    correctAnswer: q.correctAnswer,
    skor: q.skor,
    questionNumber: q.questionNumber,
    ctGroupId: q.ctGroupId,
    ctStory: q.ctStory,
    ctAspect: q.ctAspect,
  }));
  return { ...posttest, soals };
};

export const submitPosttestAnswer = async (modulId: string, answers: TestAnswer[], siswaId?: string, role?: string, timeSpent?: number) => {
  if (role !== 'siswa') throw new AppError(403, 'Hanya siswa yang bisa submit posttest.');
  const { score, totalBenar, totalSalah, isGraduated } = await progressService.calculatePosttestScore(siswaId as string, modulId, answers, timeSpent);
  const certificate = await prisma.$transaction(async (tx) => progressService.generateCertificateIfEligible(siswaId as string, modulId));
  return { score, certificate, totalBenar, totalSalah, isGraduated };
};

export const getAllPosttest = async (tutorId: string, limit: number = 10, cursor?: string) => {
  const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
  const where = buildCursorWhere(cursorPayload);
  const posttests = await prisma.posttest.findMany({ where: { ...where, modul: { tutorId } }, take: limit + 1, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  return buildCursorPaginatedResponse(posttests, limit, (item) => ({ createdAt: item.createdAt, id: item.id }));
};

export const getAllPosttestAdmin = async (limit: number = 10, cursor?: string) => {
  const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
  const posttests = await prisma.posttest.findMany({ where: buildCursorWhere(cursorPayload), take: limit + 1, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
  return buildCursorPaginatedResponse(posttests, limit, (item) => ({ createdAt: item.createdAt, id: item.id }));
};

export const getPosttestById = async (posttestId: string, tutorId?: string) => {
  const posttest = await prisma.posttest.findUnique({ where: { id: posttestId }, include: { modul: true, posttestSettings: true } });
  if (!posttest) throw new AppError(404, 'Posttest tidak ditemukan.');
  if (tutorId && posttest.modul?.tutorId !== tutorId) throw new AppError(403, 'Akses ditolak.');
  const pretest = await prisma.pretest.findFirst({
    where: { modul: { id: posttest.modul!.id } },
    include: { pretestQuestions: { include: { answerOptions: true }, orderBy: { questionNumber: { sort: 'asc', nulls: 'last' } } } },
  });
  const pretestQs = pretest?.pretestQuestions ?? [];
  const soals = pretestQs.map((q: any) => ({
    id: q.id,
    posttestId: posttest.id,
    question: q.pertanyaan,
    pilihan: (q.answerOptions ?? []).map((o: any) => o.option),
    correctAnswer: q.correctAnswer,
    skor: q.skor,
    questionNumber: q.questionNumber,
    ctGroupId: q.ctGroupId,
    ctStory: q.ctStory,
    ctAspect: q.ctAspect,
  }));
  return { ...posttest, soals };
};

export const updatePosttestRecord = async (posttestId: string, data: Record<string, any>, tutorId?: string) => {
  const posttest = await prisma.posttest.findUnique({ where: { id: posttestId }, include: { modul: true } });
  if (!posttest) throw new AppError(404, 'Posttest tidak ditemukan.');
  if (tutorId && posttest.modul?.tutorId !== tutorId) throw new AppError(403, 'Akses ditolak.');
  const updated = await prisma.posttest.update({ where: { id: posttestId }, data });
  console.log(`[POSTTEST] Posttest diupdate: ${posttestId}`);
  return updated;
};

export const deletePosttestRecord = async (posttestId: string, tutorId?: string) => {
  const posttest = await prisma.posttest.findUnique({ where: { id: posttestId }, include: { modul: true } });
  if (!posttest) throw new AppError(404, 'Posttest tidak ditemukan.');
  if (tutorId && posttest.modul?.tutorId !== tutorId) throw new AppError(403, 'Akses ditolak.');
  await prisma.posttest.delete({ where: { id: posttestId } });
  console.log(`[POSTTEST] Posttest dihapus: ${posttestId}`);
  return { message: 'Posttest berhasil dihapus.' };
};

export const updatePosttestQuestion = async (soalId: string, data: { pertanyaan?: string; pilihan?: any; jawaban_benar?: string; skor?: number; questionNumber?: number | null; ctGroupId?: string; ctStory?: string; ctAspect?: string }, tutorId?: string) => {
  const pretestPayload = Object.fromEntries(
    Object.entries({
      pertanyaan: data.pertanyaan, pilihan: data.pilihan, jawaban_benar: data.jawaban_benar, skor: data.skor,
      questionNumber: data.questionNumber, ctGroupId: data.ctGroupId, ctStory: data.ctStory, ctAspect: data.ctAspect,
    }).filter(([_, v]) => v !== undefined)
  );
  return updatePretestQuestion(soalId, pretestPayload as any, tutorId);
};

export const deletePosttestQuestion = async (soalId: string, tutorId?: string) => {
  return deletePretestQuestion(soalId, tutorId);
};

export const upsertPosttestSettings = async (posttestId: string, data: { duration: number; countShownQuestions?: number }, tutorId?: string) => {
  const posttest = await prisma.posttest.findUnique({ where: { id: posttestId }, include: { modul: true } });
  if (!posttest) throw new AppError(404, 'Posttest tidak ditemukan.');
  if (tutorId && posttest.modul?.tutorId !== tutorId) throw new AppError(403, 'Akses ditolak.');
  const existing = await prisma.posttestSetting.findFirst({ where: { posttestId } });
  if (existing) {
    const updated = await prisma.posttestSetting.update({ where: { id: existing.id }, data });
    if (data.countShownQuestions !== undefined && posttest.modul) {
      await prisma.progress.updateMany({ where: { modulId: posttest.modul.id, posttestCompleted: false }, data: { posttestAssignedQuestions: '[]' } });
    }
    return updated;
  }
  return prisma.posttestSetting.create({ data: { posttestId, duration: data.duration, countShownQuestions: data.countShownQuestions ?? 0 } });
};

export const deleteAllPosttestQuestions = async (posttestId: string, tutorId?: string) => {
  const posttest = await prisma.posttest.findUnique({ where: { id: posttestId }, include: { modul: true } });
  if (!posttest) throw new AppError(404, 'Posttest tidak ditemukan.');
  if (tutorId && posttest.modul?.tutorId !== tutorId) throw new AppError(403, 'Akses ditolak.');
  const pretest = await prisma.pretest.findFirst({ where: { modul: { id: posttest.modul!.id } } });
  if (!pretest) throw new AppError(404, 'Pretest tidak ditemukan.');
  return deleteAllPretestQuestions(pretest.id, tutorId);
};
