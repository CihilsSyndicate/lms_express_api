import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createMateri = async (req: Request, res: Response) => {
  try {
    const { modul_id, is_video, video_url, article } = req.body;
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
          'Akses ditolak. Anda tidak berhak menambah materi ke modul ini.',
      });
    }

    const newMateri = await prisma.materi.create({
      data: {
        modul_id,
        tutor_id: tutorId,
        is_video: is_video ?? false,
        video_url,
        article,
      },
    });

    console.log(
      `[MATERI] Materi baru dibuat oleh Tutor ${tutorId}: ${newMateri.id}`,
    );
    res
      .status(201)
      .json({ message: 'Materi berhasil dibuat', data: newMateri });
  } catch (error) {
    console.error('[MATERI-ERROR] Gagal membuat materi:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat membuat materi.' });
  }
};

export const getMateriByModul = async (req: Request, res: Response) => {
  try {
    const { modulId } = req.params;

    const materis = await prisma.materi.findMany({
      where: { modul_id: modulId as string },
      include: {
        submateris: true,
        tutor: { select: { nama_lengkap: true } },
      },
    });

    res
      .status(200)
      .json({ message: 'Berhasil mengambil data materi', data: materis });
  } catch (error) {
    console.error('[MATERI-ERROR] Gagal mengambil materi:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil materi.' });
  }
};

export const updateMateri = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_video, video_url, article } = req.body;
    const tutorId = req.user?.id;

    const materi = await prisma.materi.findUnique({
      where: { id: id as string },
      include: { modul: true },
    });

    if (!materi) {
      return res.status(404).json({ message: 'Materi tidak ditemukan.' });
    }

    if (materi.modul.tutor_id !== tutorId) {
      return res.status(403).json({
        message: 'Akses ditolak. Anda tidak berhak mengubah materi ini.',
      });
    }

    const updatedMateri = await prisma.materi.update({
      where: { id: id as string },
      data: { is_video, video_url, article },
    });

    console.log(`[MATERI] Materi diupdate oleh Tutor ${tutorId}: ${id}`);
    res
      .status(200)
      .json({ message: 'Materi berhasil diupdate', data: updatedMateri });
  } catch (error) {
    console.error('[MATERI-ERROR] Gagal update materi:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat update materi.' });
  }
};

export const deleteMateri = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tutorId = req.user?.id;

    const materi = await prisma.materi.findUnique({
      where: { id: id as string },
      include: { modul: true },
    });

    if (!materi) {
      return res.status(404).json({ message: 'Materi tidak ditemukan.' });
    }

    if (materi.modul.tutor_id !== tutorId) {
      return res.status(403).json({
        message: 'Akses ditolak. Anda tidak berhak menghapus materi ini.',
      });
    }

    await prisma.materi.delete({ where: { id: id as string } });

    console.log(`[MATERI] Materi dihapus oleh Tutor ${tutorId}: ${id}`);
    res.status(200).json({ message: 'Materi berhasil dihapus' });
  } catch (error) {
    console.error('[MATERI-ERROR] Gagal hapus materi:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat menghapus materi.' });
  }
};
