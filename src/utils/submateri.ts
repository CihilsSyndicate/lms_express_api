import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

export const createSubmaterial = async (req: Request, res: Response) => {
  try {
    const { materi_id, judul, konten } = req.body;
    const tutorId = req.user?.id;

    if (!tutorId) {
      return res.status(401).json({ message: 'Akses ditolak.' });
    }

    const materi = await prisma.materi.findUnique({
      where: { id: materi_id },
    });

    if (!materi || materi.tutor_id !== tutorId) {
      return res.status(403).json({
        message:
          'Akses ditolak. Anda tidak berhak menambah submateri ke materi ini.',
      });
    }

    const newSubmaterial = await prisma.submateri.create({
      data: {
        materi_id,
        judul,
        konten,
      },
    });

    console.log(
      `[SUBMATERI] Submateri baru dibuat oleh Tutor ${tutorId}: ${newSubmaterial.id}`,
    );
    return res
      .status(201)
      .json({ message: 'Submateri berhasil dibuat', data: newSubmaterial });
  } catch (error) {
    console.error('[SUBMATERI-ERROR] Gagal membuat submateri:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error saat membuat submateri.' });
  }
};

export const getSubmaterialsByMaterial = async (
  req: Request,
  res: Response,
) => {
  try {
    const { materiId } = req.params;

    const submaterials = await prisma.submateri.findMany({
      where: { materi_id: materiId as string },
    });

    return res.status(200).json({
      message: 'Berhasil mengambil data submateri',
      data: submaterials,
    });
  } catch (error) {
    console.error('[SUBMATERI-ERROR] Gagal mengambil submateri:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error saat mengambil submateri.' });
  }
};

export const getSubmaterialDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const submateri = await prisma.submateri.findUnique({
      where: { id: id as string },
      include: {
        materi: { include: { modul: true } },
      },
    });

    if (!submateri) {
      return res.status(404).json({ message: 'Submateri tidak ditemukan.' });
    }

    return res.status(200).json({
      message: 'Berhasil mengambil detail submateri',
      data: submateri,
    });
  } catch (error) {
    console.error('[SUBMATERI-ERROR] Gagal mengambil detail submateri:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error saat mengambil submateri.' });
  }
};

export const updateSubmaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { judul, konten } = req.body;
    const tutorId = req.user?.id;

    const submateri = await prisma.submateri.findUnique({
      where: { id: id as string },
      include: { materi: true },
    });

    if (!submateri) {
      return res.status(404).json({ message: 'Submateri tidak ditemukan.' });
    }

    if (submateri.materi.tutor_id !== tutorId) {
      return res.status(403).json({
        message: 'Akses ditolak. Anda tidak berhak mengubah submateri ini.',
      });
    }

    const updatedSubmaterial = await prisma.submateri.update({
      where: { id: id as string },
      data: { judul, konten },
    });

    console.log(`[SUBMATERI] Submateri diupdate oleh Tutor ${tutorId}: ${id}`);
    return res.status(200).json({
      message: 'Submateri berhasil diupdate',
      data: updatedSubmaterial,
    });
  } catch (error) {
    console.error('[SUBMATERI-ERROR] Gagal update submateri:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error saat update submateri.' });
  }
};

export const deleteSubmaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tutorId = req.user?.id;

    const submateri = await prisma.submateri.findUnique({
      where: { id: id as string },
      include: { materi: true },
    });

    if (!submateri) {
      return res.status(404).json({ message: 'Submateri tidak ditemukan.' });
    }

    if (submateri.materi.tutor_id !== tutorId) {
      return res.status(403).json({
        message: 'Akses ditolak. Anda tidak berhak menghapus submateri ini.',
      });
    }

    await prisma.submateri.delete({ where: { id: id as string } });

    console.log(`[SUBMATERI] Submateri dihapus oleh Tutor ${tutorId}: ${id}`);
    return res.status(200).json({ message: 'Submateri berhasil dihapus' });
  } catch (error) {
    console.error('[SUBMATERI-ERROR] Gagal hapus submateri:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error saat menghapus submateri.' });
  }
};
