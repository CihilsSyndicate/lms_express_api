import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { ProgressService } from '@/modules/access/siswa/progress/progress.service';

const progressService = new ProgressService();

export const createPosttest = async (req: Request, res: Response) => {
  try {
    const { modul_id } = req.body;
    const tutorId = req.user?.id;

    if (!tutorId) {
      return res.status(401).json({ message: 'Akses ditolak.' });
    }

    const modul = await prisma.modul.findFirst({
      where: { id: modul_id },
    });

    if (!modul || modul.tutor_id !== tutorId) {
      return res.status(403).json({
        message:
          'Akses ditolak. Anda tidak berhak membuat posttest untuk modul ini.',
      });
    }

    const newPosttest = await prisma.posttest.create({
      data: { modul: { connect: { id: modul_id } } },
    });

    await prisma.modul.update({
      where: { id: modul_id },
      data: { posttest_id: newPosttest.id },
    });

    console.log(
      `[POSTTEST] Posttest baru dibuat oleh Tutor ${tutorId}: ${newPosttest.id}`,
    );
    return res
      .status(201)
      .json({ message: 'Posttest berhasil dibuat', data: newPosttest });
  } catch (error) {
    console.error('[POSTTEST-ERROR] Gagal membuat posttest:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error saat membuat posttest.' });
  }
};

export const addSoalPosttest = async (req: Request, res: Response) => {
  try {
    const { posttest_id, pertanyaan, pilihan, jawaban_benar, skor } = req.body;
    const tutorId = req.user?.id;

    const posttest = await prisma.posttest.findUnique({
      where: { id: posttest_id },
      include: { modul: true },
    });

    if (!posttest || posttest?.modul?.tutor_id !== tutorId) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    const newSoal = await prisma.soalPosttest.create({
      data: {
        posttest_id,
        pertanyaan,
        pilihan,
        jawaban_benar,
        skor: skor ?? 10,
      },
    });

    console.log(`[POSTTEST] Soal posttest ditambah: ${newSoal.id}`);
    return res
      .status(201)
      .json({ message: 'Soal posttest berhasil ditambah', data: newSoal });
  } catch (error) {
    console.error('[POSTTEST-ERROR] Gagal menambah soal posttest:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error saat menambah soal.' });
  }
};

export const getPosttestByModul = async (req: Request, res: Response) => {
  try {
    const { modulId } = req.params;

    const posttest = await prisma.posttest.findFirst({
      where: { modul: { id: modulId as string } },
      include: { soals: true },
    });

    if (!posttest) {
      return res.status(404).json({ message: 'Posttest tidak ditemukan.' });
    }

    return res
      .status(200)
      .json({ message: 'Berhasil mengambil posttest', data: posttest });
  } catch (error) {
    console.error('[POSTTEST-ERROR] Gagal mengambil posttest:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error saat mengambil posttest.' });
  }
};

export const submitPosttest = async (req: Request, res: Response) => {
  try {
    const { modulId } = req.params;
    const { answers } = req.body;
    const siswaId = req.user?.id;

    if (req.user?.role !== 'siswa') {
      return res
        .status(403)
        .json({ message: 'Hanya siswa yang bisa submit posttest.' });
    }

    const score = await progressService.calculatePosttestScore(
      siswaId as string,
      modulId as string,
      answers,
    );

    const cert = await progressService.generateCertificateIfEligible(
      siswaId as string,
      modulId as string,
    );

    return res.status(200).json({
      message: 'Posttest berhasil disubmit',
      score,
      certificate: cert,
    });
  } catch (error) {
    console.error('[POSTTEST-ERROR] Gagal submit posttest:', error);
    return res
      .status(500)
      .json({ message: 'Internal server error saat submit posttest.' });
  }
};
