import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ProgressService } from '../services/ProgressService';

const progressService = new ProgressService();

export const createPretest = async (req: Request, res: Response) => {
  try {
    const { modul_id } = req.body;
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
          'Akses ditolak. Anda tidak berhak membuat pretest untuk modul ini.',
      });
    }

    const newPretest = await prisma.pretest.create({
      data: { modul_id },
    });

    // Link to modul
    await prisma.modul.update({
      where: { id: modul_id },
      data: { pretest_id: newPretest.id },
    });

    console.log(
      `[PRETEST] Pretest baru dibuat oleh Tutor ${tutorId}: ${newPretest.id}`,
    );
    res
      .status(201)
      .json({ message: 'Pretest berhasil dibuat', data: newPretest });
  } catch (error) {
    console.error('[PRETEST-ERROR] Gagal membuat pretest:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat membuat pretest.' });
  }
};

export const addSoalPretest = async (req: Request, res: Response) => {
  try {
    const { pretest_id, pertanyaan, pilihan, jawaban_benar, skor } = req.body;
    const tutorId = req.user?.id;

    // Verify tutor owns the pretest
    const pretest = await prisma.pretest.findUnique({
      where: { id: pretest_id },
      include: { modul: true },
    });

    if (!pretest || pretest?.modul?.tutor_id !== tutorId) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    const newSoal = await prisma.soalPretest.create({
      data: {
        pretest_id,
        pertanyaan,
        pilihan,
        jawaban_benar,
        skor: skor ?? 10,
      },
    });

    console.log(`[PRETEST] Soal pretest ditambah: ${newSoal.id}`);
    res
      .status(201)
      .json({ message: 'Soal pretest berhasil ditambah', data: newSoal });
  } catch (error) {
    console.error('[PRETEST-ERROR] Gagal menambah soal pretest:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat menambah soal.' });
  }
};

export const getPretestByModul = async (req: Request, res: Response) => {
  try {
    const { modulId } = req.params;

    const pretest = await prisma.pretest.findFirst({
      where: { modul: { id: modulId as string } },
      include: { soals: true },
    });

    if (!pretest) {
      return res.status(404).json({ message: 'Pretest tidak ditemukan.' });
    }

    res
      .status(200)
      .json({ message: 'Berhasil mengambil pretest', data: pretest });
  } catch (error) {
    console.error('[PRETEST-ERROR] Gagal mengambil pretest:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil pretest.' });
  }
};

export const submitPretest = async (req: Request, res: Response) => {
  try {
    const { modulId } = req.params;
    const { answers } = req.body; // [{ questionId, answer }]
    const siswaId = req.user?.id;

    if (req.user?.role !== 'siswa') {
      return res
        .status(403)
        .json({ message: 'Hanya siswa yang bisa submit pretest.' });
    }

    const score = await progressService.calculatePretestScore(
      siswaId as string,
      modulId as string,
      answers,
    );

    res.status(200).json({ message: 'Pretest berhasil disubmit', score });
  } catch (error) {
    console.error('[PRETEST-ERROR] Gagal submit pretest:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat submit pretest.' });
  }
};
