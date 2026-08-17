import { prisma } from '@/lib/prisma';
import { AppError } from '@/errors/app.error';

type AssessmentWhere = { pretestId?: string; posttestId?: string };

export const getAksesMateriByAssessment = async (where: AssessmentWhere) => {
  return prisma.automaticAccessMatery.findMany({
    where,
    include: {
      materi: { select: { id: true, judul: true } },
      selectedTopics: { select: { id: true, nama: true } },
    },
  });
};

export const createAksesMateri = async (
  data: {
    pretestId?: string | undefined;
    posttestId?: string | undefined;
    materiId?: string | undefined;
    minScore: number;
    selectedTopicIds?: string[] | undefined;
    modulId?: string | undefined;
  },
  tutorId?: string,
) => {
  if (tutorId) {
    let ownerModul: { modul: { tutorId: string | null } | null } | null = null;
    if (data.posttestId) {
      const posttest = await prisma.posttest.findUnique({
        where: { id: data.posttestId },
        include: { modul: true },
      });
      if (!posttest) throw new AppError(404, 'Asesmen tidak ditemukan.');
      ownerModul = posttest;
    } else if (data.pretestId) {
      const pretest = await prisma.pretest.findUnique({
        where: { id: data.pretestId },
        include: { modul: true },
      });
      if (!pretest) throw new AppError(404, 'Asesmen tidak ditemukan.');
      ownerModul = pretest;
    }
    if (!ownerModul) throw new AppError(400, 'pretestId atau posttestId wajib diisi.');
    if (ownerModul.modul?.tutorId !== tutorId) throw new AppError(403, 'Akses ditolak.');
  }

  return prisma.automaticAccessMatery.create({
    data: {
      ...(data.pretestId ? { pretestId: data.pretestId } : {}),
      ...(data.posttestId ? { posttestId: data.posttestId } : {}),
      ...(data.materiId ? { materiId: data.materiId } : {}),
      minScore: data.minScore,
      ...(data.modulId ? { modulId: data.modulId } : {}),
      ...(data.selectedTopicIds?.length
        ? { selectedTopics: { connect: data.selectedTopicIds.map((id) => ({ id })) } }
        : {}),
    },
    include: {
      materi: { select: { id: true, judul: true } },
      selectedTopics: { select: { id: true, nama: true } },
    },
  });
};

export const updateAksesMateri = async (
  id: string,
  data: {
    materiId?: string | undefined;
    minScore?: number | undefined;
    selectedTopicIds?: string[] | undefined;
  },
  tutorId?: string,
) => {
  const existing = await prisma.automaticAccessMatery.findUnique({
    where: { id },
    include: { pretest: { include: { modul: true } }, posttest: { include: { modul: true } } },
  });
  if (!existing) throw new AppError(404, 'Aturan akses materi tidak ditemukan.');
  const ownerModul = existing.pretest ?? existing.posttest;
  if (tutorId && ownerModul?.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  const updateData: any = {};
  if (data.materiId !== undefined) updateData.materiId = data.materiId;
  if (data.minScore !== undefined) updateData.minScore = data.minScore;

  if (data.selectedTopicIds !== undefined) {
    updateData.selectedTopics = {
      set: [],
      connect: data.selectedTopicIds.map((id) => ({ id })),
    };
  }

  return prisma.automaticAccessMatery.update({
    where: { id },
    data: updateData,
    include: {
      materi: { select: { id: true, judul: true } },
      selectedTopics: { select: { id: true, nama: true } },
    },
  });
};

export const deleteAksesMateri = async (id: string, tutorId?: string) => {
  const existing = await prisma.automaticAccessMatery.findUnique({
    where: { id },
    include: { pretest: { include: { modul: true } }, posttest: { include: { modul: true } } },
  });
  if (!existing) throw new AppError(404, 'Aturan akses materi tidak ditemukan.');
  const ownerModul = existing.pretest ?? existing.posttest;
  if (tutorId && ownerModul?.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  await prisma.automaticAccessMatery.delete({ where: { id } });
  return { message: 'Aturan akses materi berhasil dihapus.' };
};
