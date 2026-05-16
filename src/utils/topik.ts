import { AppError } from '@/errors/app.error';
import { prisma } from '@/lib/prisma';
import type {
  CreateTopikRecord,
  UpdateTopikRecord,
} from '@/validators/topik/topik.validator';

/**
 * Domain/Business Logic Functions for Topik (Topic)
 * These functions contain business rules, data validation, and orchestration.
 */

export const createTopik = async (
  payload: CreateTopikRecord,
  tutorId?: string,
) => {
  if (!tutorId) {
    throw new AppError(401, 'Akses ditolak.');
  }

  const modul = await prisma.modul.findUnique({
    where: { id: payload.modul_id },
  });

  if (!modul || modul.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak menambah topik ke modul ini.',
    );
  }

  const newTopic = await prisma.topik.create({
    data: {
      modulId: payload.modul_id,
      nama: payload.nama,
    },
  });

  console.log(
    `[TOPIK] Topik baru dibuat oleh Tutor ${tutorId}: ${newTopic.id}`,
  );

  return newTopic;
};

export const getTopikList = async (modulId: string) => {
  return prisma.topik.findMany({
    where: { modulId: modulId },
  });
};

export const updateTopik = async (
  topikId: string,
  payload: UpdateTopikRecord,
  tutorId?: string,
) => {
  const topik = await prisma.topik.findUnique({
    where: { id: topikId },
    include: { modul: true },
  });

  if (!topik) {
    throw new AppError(404, 'Topik tidak ditemukan.');
  }

  if (topik.modul.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak mengubah topik ini.',
    );
  }

  const data: { nama?: string } = {};
  if (payload.nama !== undefined) data.nama = payload.nama;

  const updatedTopic = await prisma.topik.update({
    where: { id: topikId },
    data,
  });

  console.log(`[TOPIK] Topik diupdate oleh Tutor ${tutorId}: ${topikId}`);

  return updatedTopic;
};

export const deleteTopik = async (topikId: string, tutorId?: string) => {
  const topik = await prisma.topik.findUnique({
    where: { id: topikId },
    include: { modul: true },
  });

  if (!topik) {
    throw new AppError(404, 'Topik tidak ditemukan.');
  }

  if (topik.modul.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak menghapus topik ini.',
    );
  }

  await prisma.topik.delete({ where: { id: topikId } });
  console.log(`[TOPIK] Topik dihapus oleh Tutor ${tutorId}: ${topikId}`);
};
