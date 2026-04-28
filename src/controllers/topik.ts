import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createTopik = async (req: Request, res: Response) => {
  try {
    const { modul_id, nama } = req.body;
    const tutorId = req.user?.id;

    if (!tutorId) {
      return res.status(401).json({ message: 'Akses ditolak.' });
    }

    // Verify tutor owns the modul
    const modul = await prisma.modul.findUnique({
      where: { id: modul_id },
    });

    if (!modul || modul.tutor_id !== tutorId) {
      return res.status(403).json({
        message:
          'Akses ditolak. Anda tidak berhak menambah topik ke modul ini.',
      });
    }

    const newTopik = await prisma.topik.create({
      data: {
        modul_id,
        nama,
      },
    });

    console.log(
      `[TOPIK] Topik baru dibuat oleh Tutor ${tutorId}: ${newTopik.id}`,
    );
    res.status(201).json({ message: 'Topik berhasil dibuat', data: newTopik });
  } catch (error) {
    console.error('[TOPIK-ERROR] Gagal membuat topik:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat membuat topik.' });
  }
};

export const getTopikByModul = async (req: Request, res: Response) => {
  try {
    const { modulId } = req.params;

    const topiks = await prisma.topik.findMany({
      where: { modul_id: modulId as string },
    });

    res
      .status(200)
      .json({ message: 'Berhasil mengambil data topik', data: topiks });
  } catch (error) {
    console.error('[TOPIK-ERROR] Gagal mengambil topik:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil topik.' });
  }
};

export const updateTopik = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;
    const tutorId = req.user?.id;

    const topik = await prisma.topik.findUnique({
      where: { id: id as string },
      include: { modul: true },
    });

    if (!topik) {
      return res.status(404).json({ message: 'Topik tidak ditemukan.' });
    }

    if (topik.modul.tutor_id !== tutorId) {
      return res.status(403).json({
        message: 'Akses ditolak. Anda tidak berhak mengubah topik ini.',
      });
    }

    const updatedTopik = await prisma.topik.update({
      where: { id: id as string },
      data: { nama },
    });

    console.log(`[TOPIK] Topik diupdate oleh Tutor ${tutorId}: ${id}`);
    res
      .status(200)
      .json({ message: 'Topik berhasil diupdate', data: updatedTopik });
  } catch (error) {
    console.error('[TOPIK-ERROR] Gagal update topik:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat update topik.' });
  }
};

export const deleteTopik = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tutorId = req.user?.id;

    const topik = await prisma.topik.findUnique({
      where: { id: id as string },
      include: { modul: true },
    });

    if (!topik) {
      return res.status(404).json({ message: 'Topik tidak ditemukan.' });
    }

    if (topik.modul.tutor_id !== tutorId) {
      return res.status(403).json({
        message: 'Akses ditolak. Anda tidak berhak menghapus topik ini.',
      });
    }

    await prisma.topik.delete({ where: { id: id as string } });

    console.log(`[TOPIK] Topik dihapus oleh Tutor ${tutorId}: ${id}`);
    res.status(200).json({ message: 'Topik berhasil dihapus' });
  } catch (error) {
    console.error('[TOPIK-ERROR] Gagal hapus topik:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat menghapus topik.' });
  }
};
