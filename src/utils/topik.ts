import { AppError } from '@/errors/app.error';
import { ItemType } from '@/generated/prisma/edge';
import { prisma } from '@/lib/prisma';
import type {
  CreateTopikRecord,
  UpdateTopikRecord,
} from '@/validators/topik/topik.validator';

import { validateTopikItemPolymorphism } from '@/validators/topikItem/topikItem.validator';

/**
 * Domain/Business Logic Functions for Topik (Topic)
 * These functions contain business rules, data validation, and orchestration.
 */

export const createTopikItem = async (
  payload: {
    topikId: string;
    itemId: string;
    itemType: 'MATERI' | 'QUIZ';
    orderNumber: number;
  },
  tutorId?: string,
  userRole?: string,
) => {
  if (!tutorId) {
    throw new AppError(401, 'Akses ditolak.');
  }

  const topik = await prisma.topik.findUnique({
    where: { id: payload.topikId },
    include: { modul: true },
  });

  if (!topik) throw new AppError(404, 'Topik tidak ditemukan.');

  if (userRole !== 'admin' && topik.modul.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak menambah item ke topik ini.',
    );
  }

  // Phase 1: Domain Validation for Polymorphic Relationship
  await validateTopikItemPolymorphism(payload.itemId, payload.itemType);

  const newItem = await prisma.topikItem.create({
    data: {
      topikId: payload.topikId,
      itemId: payload.itemId,
      itemType: payload.itemType as ItemType,
      orderNumber: payload.orderNumber,
    },
  });

  return newItem;
};

export const createTopik = async (
  payload: CreateTopikRecord,
  tutorId?: string,
  userRole?: string,
) => {
  if (!tutorId) {
    throw new AppError(401, 'Akses ditolak.');
  }

  const modul = await prisma.modul.findUnique({
    where: { id: payload.modul_id },
  });

  if (!modul) throw new AppError(404, 'Modul tidak ditemukan.');

  if (userRole !== 'admin' && modul.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak menambah topik ke modul ini.',
    );
  }

  const newTopic = await prisma.topik.create({
    data: {
      modulId: payload.modul_id,
      nama: payload.nama,
      isComputationalThinking: modul.isTestComputationalThinking,
    },
  });

  console.log(
    `[TOPIK] Topik baru dibuat oleh ${userRole || 'Tutor'} ${tutorId}: ${newTopic.id}`,
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
  userRole?: string,
) => {
  const topik = await prisma.topik.findUnique({
    where: { id: topikId },
    include: { modul: true },
  });

  if (!topik) {
    throw new AppError(404, 'Topik tidak ditemukan.');
  }

  if (userRole !== 'admin' && topik.modul.tutorId !== tutorId) {
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

  console.log(
    `[TOPIK] Topik diupdate oleh ${userRole || 'Tutor'} ${tutorId}: ${topikId}`,
  );

  return updatedTopic;
};

export const deleteTopik = async (
  topikId: string,
  tutorId?: string,
  userRole?: string,
) => {
  const topik = await prisma.topik.findUnique({
    where: { id: topikId },
    include: { modul: true },
  });

  if (!topik) {
    throw new AppError(404, 'Topik tidak ditemukan.');
  }

  if (userRole !== 'admin' && topik.modul.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak menghapus topik ini.',
    );
  }

  await prisma.topik.delete({ where: { id: topikId } });
  console.log(
    `[TOPIK] Topik dihapus oleh ${userRole || 'Tutor'} ${tutorId}: ${topikId}`,
  );

  return { message: 'Topik berhasil dihapus' };
};
