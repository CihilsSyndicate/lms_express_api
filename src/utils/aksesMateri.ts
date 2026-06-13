import { prisma } from '@/lib/prisma';
import { AppError } from '@/errors/app.error';

export const getAksesMateriByPretest = async (pretestId: string) => {
  return prisma.automaticAccessMatery.findMany({
    where: { pretestId },
    include: {
      materi: { select: { id: true, judul: true } },
      selectedTopics: { select: { id: true, nama: true } },
    },
  });
};

export const createAksesMateri = async (
  data: {
    pretestId: string;
    materiId: string;
    minScore: number;
    selectedTopicIds?: string[];
    modulId?: string;
  },
  tutorId?: string,
) => {
  if (tutorId) {
    const pretest = await prisma.pretest.findUnique({
      where: { id: data.pretestId },
      include: { modul: true },
    });
    if (!pretest) throw new AppError(404, 'Pretest tidak ditemukan.');
    if (pretest.modul?.tutorId !== tutorId) throw new AppError(403, 'Akses ditolak.');
  }

  return prisma.automaticAccessMatery.create({
    data: {
      pretestId: data.pretestId,
      materiId: data.materiId,
      minScore: data.minScore,
      modulId: data.modulId,
      selectedTopics: data.selectedTopicIds?.length
        ? { connect: data.selectedTopicIds.map((id) => ({ id })) }
        : undefined,
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
    materiId?: string;
    minScore?: number;
    selectedTopicIds?: string[];
  },
  tutorId?: string,
) => {
  const existing = await prisma.automaticAccessMatery.findUnique({
    where: { id },
    include: { pretest: { include: { modul: true } } },
  });
  if (!existing) throw new AppError(404, 'Aturan akses materi tidak ditemukan.');
  if (tutorId && existing.pretest?.modul?.tutorId !== tutorId) {
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
    include: { pretest: { include: { modul: true } } },
  });
  if (!existing) throw new AppError(404, 'Aturan akses materi tidak ditemukan.');
  if (tutorId && existing.pretest?.modul?.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak.');
  }

  await prisma.automaticAccessMatery.delete({ where: { id } });
  return { message: 'Aturan akses materi berhasil dihapus.' };
};
