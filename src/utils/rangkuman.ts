import { AppError } from '@/errors/app.error';
import { prisma } from '@/lib/prisma';

export const createRangkuman = async (
  payload: { topik_id: string; judul: string; konten?: string | null },
  tutorId?: string,
  userRole?: string,
) => {
  if (!tutorId) {
    throw new AppError(401, 'Akses ditolak.');
  }

  const topik = await prisma.topik.findUnique({
    where: { id: payload.topik_id },
    include: { modul: true },
  });

  if (!topik) throw new AppError(404, 'Topik tidak ditemukan.');

  if (userRole !== 'admin' && topik.modul.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak. Anda tidak berhak menambah rangkuman ke topik ini.');
  }

  const newRangkuman = await prisma.rangkuman.create({
    data: {
      topikId: payload.topik_id,
      tutorId: userRole === 'admin' ? topik.modul.tutorId : tutorId,
      judul: payload.judul,
      konten: payload.konten ?? null,
    },
  });

  const lastItem = await prisma.topikItem.findFirst({
    where: { topikId: payload.topik_id },
    orderBy: { orderNumber: 'desc' },
  });

  await prisma.topikItem.create({
    data: {
      topikId: payload.topik_id,
      itemId: newRangkuman.id,
      itemType: 'RANGKUMAN_TOPIK',
      orderNumber: (lastItem?.orderNumber ?? 0) + 1,
    },
  });

  console.log(`[RANGKUMAN] Rangkuman baru dibuat oleh ${userRole || 'Tutor'} ${tutorId}: ${newRangkuman.id}`);

  return newRangkuman;
};

export const updateRangkuman = async (
  rangkumanId: string,
  payload: { judul?: string; konten?: string | null },
  tutorId?: string,
  userRole?: string,
) => {
  const rangkuman = await prisma.rangkuman.findUnique({
    where: { id: rangkumanId },
    include: { topik: { include: { modul: true } } },
  });

  if (!rangkuman) throw new AppError(404, 'Rangkuman tidak ditemukan.');

  if (userRole !== 'admin' && rangkuman.topik.modul.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak. Anda tidak berhak mengubah rangkuman ini.');
  }

  const data: { judul?: string; konten?: string | null } = {};
  if (payload.judul !== undefined) data.judul = payload.judul;
  if (payload.konten !== undefined) data.konten = payload.konten;

  const updated = await prisma.rangkuman.update({
    where: { id: rangkumanId },
    data,
  });

  console.log(`[RANGKUMAN] Rangkuman diupdate oleh ${userRole || 'Tutor'} ${tutorId}: ${rangkumanId}`);

  return updated;
};

export const deleteRangkuman = async (
  rangkumanId: string,
  tutorId?: string,
  userRole?: string,
) => {
  const rangkuman = await prisma.rangkuman.findUnique({
    where: { id: rangkumanId },
    include: { topik: { include: { modul: true } } },
  });

  if (!rangkuman) throw new AppError(404, 'Rangkuman tidak ditemukan.');

  if (userRole !== 'admin' && rangkuman.topik.modul.tutorId !== tutorId) {
    throw new AppError(403, 'Akses ditolak. Anda tidak berhak menghapus rangkuman ini.');
  }

  await prisma.topikItem.deleteMany({ where: { itemId: rangkumanId } });
  await prisma.rangkuman.delete({ where: { id: rangkumanId } });

  console.log(`[RANGKUMAN] Rangkuman dihapus oleh ${userRole || 'Tutor'} ${tutorId}: ${rangkumanId}`);

  return { message: 'Rangkuman berhasil dihapus' };
};
