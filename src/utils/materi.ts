import { AppError } from '@/errors/app.error';
import { prisma } from '@/lib/prisma';
import type {
  CreateMateriRecord,
  UpdateMateriRecord,
} from '@/validators/materi/materi.validator';

/**
 * Domain/Business Logic Functions for Materi (Material)
 * These functions contain business rules, data validation, and orchestration.
 */

export const createMateri = async (
  payload: CreateMateriRecord,
  tutorId?: string,
) => {
  if (!tutorId) {
    throw new AppError(401, 'Akses ditolak.');
  }

  const topik = await prisma.topik.findUnique({
    where: { id: payload.topik_id },
    include: { modul: true },
  });

  if (!topik || topik.modul.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak menambah materi ke topik ini.',
    );
  }

  const data: {
    topikId: string;
    tutorId: string;
    isVideo: boolean;
    videoUrl?: string | null;
    article?: string | null;
  } = {
    topikId: payload.topik_id,
    tutorId: tutorId,
    isVideo: payload.is_video ?? false,
  };

  if (payload.video_url !== undefined) data.videoUrl = payload.video_url;
  if (payload.article !== undefined) data.article = payload.article;

  const newMaterial = await prisma.materi.create({ data });

  console.log(
    `[MATERI] Materi baru dibuat oleh Tutor ${tutorId}: ${newMaterial.id}`,
  );

  return newMaterial;
};

export const getMateriList = async (modulId: string) => {
  return prisma.materi.findMany({
    where: { topik: { modulId: modulId } },
    include: {
      submateris: true,
      tutor: { select: { fullName: true } },
    },
  });
};

export const updateMateri = async (
  materiId: string,
  payload: UpdateMateriRecord,
  tutorId?: string,
) => {
  const materi = await prisma.materi.findUnique({
    where: { id: materiId },
    include: { topik: { include: { modul: true } } },
  });

  if (!materi) {
    throw new AppError(404, 'Materi tidak ditemukan.');
  }

  if (materi.topik.modul.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak mengubah materi ini.',
    );
  }

  const data: {
    isVideo?: boolean;
    videoUrl?: string | null;
    article?: string | null;
  } = {};

  if (payload.is_video !== undefined) data.isVideo = payload.is_video;
  if (payload.video_url !== undefined) data.videoUrl = payload.video_url;
  if (payload.article !== undefined) data.article = payload.article;

  const updatedMaterial = await prisma.materi.update({
    where: { id: materiId },
    data,
  });

  console.log(`[MATERI] Materi diupdate oleh Tutor ${tutorId}: ${materiId}`);

  return updatedMaterial;
};

export const deleteMateri = async (materiId: string, tutorId?: string) => {
  const materi = await prisma.materi.findUnique({
    where: { id: materiId },
    include: { topik: { include: { modul: true } } },
  });

  if (!materi) {
    throw new AppError(404, 'Materi tidak ditemukan.');
  }

  if (materi.topik.modul.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak menghapus materi ini.',
    );
  }

  await prisma.materi.delete({ where: { id: materiId } });
  console.log(`[MATERI] Materi dihapus oleh Tutor ${tutorId}: ${materiId}`);
};
