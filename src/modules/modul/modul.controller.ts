import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { BKTService } from '../bkt/bkt.service';

const bktService = new BKTService();

export const createModul = async (req: Request, res: Response) => {
  try {
    const {
      nama_modul,
      deskripsi,
      target_waktu,
      tingkat_kesulitan,
      is_berbayar,
      harga_modul,
      jenjang,
      kelas_sekolah,
    } = req.body;

    const tutorId = req.user?.id;
    if (!tutorId) {
      return res.status(401).json({ message: 'Akses ditolak.' });
    }

    const newModul = await prisma.modul.create({
      data: {
        nama_modul,
        deskripsi,
        target_waktu,
        tingkat_kesulitan,
        is_berbayar: is_berbayar ?? false,
        harga_modul,
        jenjang,
        kelas_sekolah,
        tutor_id: tutorId,
      },
    });

    console.log(
      `[MODUL] Modul baru berhasil dibuat oleh Tutor ID ${tutorId}: ${newModul.id}`,
    );
    res.status(201).json({ message: 'Modul berhasil dibuat', data: newModul });
  } catch (error) {
    console.error('[MODUL-ERROR] Gagal membuat modul:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat membuat modul.' });
  }
};

export const getSemuaModul = async (req: Request, res: Response) => {
  try {
    const moduls = await prisma.modul.findMany({
      include: {
        tutor: { select: { nama_lengkap: true } },
      },
    });

    res
      .status(200)
      .json({ message: 'Berhasil mengambil data modul', data: moduls });
  } catch (error) {
    console.error('[MODUL-ERROR] Gagal mengambil modul:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil modul.' });
  }
};

export const getModulById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const modul = await prisma.modul.findUnique({
      where: { id: id as string },
      include: {
        tutor: { select: { nama_lengkap: true } },
        materis: {
          include: {
            submateris: true,
          },
        },
        topiks: true,
      },
    });

    if (!modul) {
      return res.status(404).json({ message: 'Modul tidak ditemukan.' });
    }

    let data = modul;

    if (user?.role === 'siswa') {
      // Evaluate unlocks for siswa
      const { unlockedSubmateris, lockedSubmateris } =
        await bktService.evaluateUnlockedContents(user.id, id as string);

      // Add unlock flags to submateris
      data.materis = data.materis.map((materi) => ({
        ...materi,
        submateris: materi.submateris.map((sub) => {
          const isLocked = !unlockedSubmateris.includes(sub.id);
          const lockInfo = lockedSubmateris.find((l) => l.id === sub.id);
          return {
            ...sub,
            is_locked: isLocked,
            unlock_reason: lockInfo?.reason || null,
            required_mastery: lockInfo?.requiredMastery || null,
            current_mastery: lockInfo?.currentMastery || null,
          };
        }),
      }));
    }

    res.status(200).json({ message: 'Berhasil mengambil data modul', data });
  } catch (error) {
    console.error('[MODUL-ERROR] Gagal mengambil modul details:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil modul.' });
  }
};

export const updateModul = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nama_modul,
      deskripsi,
      target_waktu,
      tingkat_kesulitan,
      is_berbayar,
      harga_modul,
      jenjang,
      kelas_sekolah,
    } = req.body;

    const tutorId = req.user?.id;

    const modul = await prisma.modul.findUnique({
      where: { id: id as string },
    });
    if (!modul)
      return res.status(404).json({ message: 'Modul tidak ditemukan.' });

    // Cek otorisasi, pastikan tutor yang update adalah pemilik modul
    if (modul.tutor_id !== tutorId) {
      return res.status(403).json({
        message: 'Akses ditolak. Anda tidak berhak mengubah modul ini.',
      });
    }

    const updatedModul = await prisma.modul.update({
      where: { id: id as string },
      data: {
        nama_modul,
        deskripsi,
        target_waktu,
        tingkat_kesulitan,
        is_berbayar,
        harga_modul,
        jenjang,
        kelas_sekolah,
      },
    });

    console.log(
      `[MODUL] Modul berhasil diupdate oleh Tutor ID ${tutorId}: ${id}`,
    );
    res
      .status(200)
      .json({ message: 'Modul berhasil diupdate', data: updatedModul });
  } catch (error) {
    console.error('[MODUL-ERROR] Gagal update modul:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat update modul.' });
  }
};

export const deleteModul = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tutorId = req.user?.id;

    const modul = await prisma.modul.findUnique({
      where: { id: id as string },
    });
    if (!modul)
      return res.status(404).json({ message: 'Modul tidak ditemukan.' });

    if (modul.tutor_id !== tutorId) {
      return res.status(403).json({
        message: 'Akses ditolak. Anda tidak berhak menghapus modul ini.',
      });
    }

    await prisma.modul.delete({ where: { id: id as string } });

    console.log(
      `[MODUL] Modul berhasil dihapus oleh Tutor ID ${tutorId}: ${id}`,
    );
    res.status(200).json({ message: 'Modul berhasil dihapus' });
  } catch (error) {
    console.error('[MODUL-ERROR] Gagal hapus modul:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat menghapus modul.' });
  }
};
