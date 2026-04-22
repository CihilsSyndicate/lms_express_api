import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createSubmateri = async (req: Request, res: Response) => {
  try {
    const { materi_id, judul, konten } = req.body;
    const tutorId = req.user?.id;

    if (!tutorId) {
      return res.status(401).json({ message: 'Akses ditolak.' });
    }

    // Verify tutor owns the materi
    const materi = await prisma.materi.findUnique({
      where: { id: materi_id },
    });

    if (!materi || materi.tutor_id !== tutorId) {
      return res.status(403).json({
        message:
          'Akses ditolak. Anda tidak berhak menambah submateri ke materi ini.',
      });
    }

    const newSubmateri = await prisma.submateri.create({
      data: {
        materi_id,
        judul,
        konten,
      },
    });

    console.log(
      `[SUBMATERI] Submateri baru dibuat oleh Tutor ${tutorId}: ${newSubmateri.id}`,
    );
    res
      .status(201)
      .json({ message: 'Submateri berhasil dibuat', data: newSubmateri });
  } catch (error) {
    console.error('[SUBMATERI-ERROR] Gagal membuat submateri:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat membuat submateri.' });
  }
};

export const getSubmateriByMateri = async (req: Request, res: Response) => {
  try {
    const { materiId } = req.params;

    const submateris = await prisma.submateri.findMany({
      where: { materi_id: materiId as string },
    });

    res
      .status(200)
      .json({ message: 'Berhasil mengambil data submateri', data: submateris });
  } catch (error) {
    console.error('[SUBMATERI-ERROR] Gagal mengambil submateri:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil submateri.' });
  }
};

export const getSubmateriDetail = async (req: Request, res: Response) => {
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

    res.status(200).json({
      message: 'Berhasil mengambil detail submateri',
      data: submateri,
    });
  } catch (error) {
    console.error('[SUBMATERI-ERROR] Gagal mengambil detail submateri:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil submateri.' });
  }
};

export const updateSubmateri = async (req: Request, res: Response) => {
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

    const updatedSubmateri = await prisma.submateri.update({
      where: { id: id as string },
      data: { judul, konten },
    });

    console.log(`[SUBMATERI] Submateri diupdate oleh Tutor ${tutorId}: ${id}`);
    res
      .status(200)
      .json({ message: 'Submateri berhasil diupdate', data: updatedSubmateri });
  } catch (error) {
    console.error('[SUBMATERI-ERROR] Gagal update submateri:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat update submateri.' });
  }
};

export const deleteSubmateri = async (req: Request, res: Response) => {
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
    res.status(200).json({ message: 'Submateri berhasil dihapus' });
  } catch (error) {
    console.error('[SUBMATERI-ERROR] Gagal hapus submateri:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat menghapus submateri.' });
  }
};
