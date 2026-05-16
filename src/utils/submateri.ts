import { AppError } from '@/errors/app.error';
import { prisma } from '@/lib/prisma';
import type {
  CreateSubmateriRecord,
  UpdateSubmateriRecord,
} from '@/validators/submateri/submateri.validator';

/**
 * Domain/Business Logic Functions for Submateri (Submaterial)
 * These functions contain business rules, data validation, and orchestration.
 */

export const createSubmateri = async (
  payload: CreateSubmateriRecord,
  tutorId?: string,
) => {
  if (!tutorId) {
    throw new AppError(401, 'Akses ditolak.');
  }

  const materi = await prisma.materi.findUnique({
    where: { id: payload.materi_id },
  });

  if (!materi || materi.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak menambah submateri ke materi ini.',
    );
  }

  const newSubmaterial = await prisma.submateri.create({
    data: {
      materiId: payload.materi_id,
      judul: payload.judul,
      konten: payload.konten,
    },
  });

  console.log(
    `[SUBMATERI] Submateri baru dibuat oleh Tutor ${tutorId}: ${newSubmaterial.id}`,
  );

  return newSubmaterial;
};

export const getSubmateriList = async (materiId: string) => {
  return prisma.submateri.findMany({
    where: { materiId: materiId },
  });
};

export const getSubmateriById = async (submateriId: string) => {
  const submateri = await prisma.submateri.findUnique({
    where: { id: submateriId },
    include: {
      materi: { include: { topik: { include: { modul: true } } } },
    },
  });

  if (!submateri) {
    throw new AppError(404, 'Submateri tidak ditemukan.');
  }

  return submateri;
};

export const updateSubmateri = async (
  submateriId: string,
  payload: UpdateSubmateriRecord,
  tutorId?: string,
) => {
  const submateri = await prisma.submateri.findUnique({
    where: { id: submateriId },
    include: { materi: true },
  });

  if (!submateri) {
    throw new AppError(404, 'Submateri tidak ditemukan.');
  }

  if (submateri.materi.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak mengubah submateri ini.',
    );
  }

  const data: { judul?: string; konten?: string } = {};
  if (payload.judul !== undefined) data.judul = payload.judul;
  if (payload.konten !== undefined) data.konten = payload.konten;

  const updatedSubmaterial = await prisma.submateri.update({
    where: { id: submateriId },
    data,
  });

  console.log(
    `[SUBMATERI] Submateri diupdate oleh Tutor ${tutorId}: ${submateriId}`,
  );

  return updatedSubmaterial;
};

export const deleteSubmateri = async (
  submateriId: string,
  tutorId?: string,
) => {
  const submateri = await prisma.submateri.findUnique({
    where: { id: submateriId },
    include: { materi: true },
  });

  if (!submateri) {
    throw new AppError(404, 'Submateri tidak ditemukan.');
  }

  if (submateri.materi.tutorId !== tutorId) {
    throw new AppError(
      403,
      'Akses ditolak. Anda tidak berhak menghapus submateri ini.',
    );
  }

  await prisma.submateri.delete({ where: { id: submateriId } });
  console.log(
    `[SUBMATERI] Submateri dihapus oleh Tutor ${tutorId}: ${submateriId}`,
  );
};
