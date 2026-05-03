import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const getCertificatesForSiswa = async (req: Request, res: Response) => {
  try {
    const siswaId = req.user?.id;

    if (req.user?.role !== 'siswa') {
      return res
        .status(403)
        .json({ message: 'Hanya siswa yang bisa melihat sertifikat.' });
    }

    const certificates = await prisma.certificate.findMany({
      where: { siswa_id: siswaId as string },
      include: {
        modul: { select: { nama_modul: true } },
      },
    });

    res
      .status(200)
      .json({ message: 'Berhasil mengambil sertifikat', data: certificates });
  } catch (error) {
    console.error('[CERTIFICATE-ERROR] Gagal mengambil sertifikat:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil sertifikat.' });
  }
};

export const getCertificateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const siswaId = req.user?.id;

    const certificate = await prisma.certificate.findUnique({
      where: { id: id as string },
      include: {
        siswa: { select: { nama_lengkap: true } },
        modul: {
          select: { nama_modul: true, jenjang: true, kelas_sekolah: true },
        },
      },
    });

    if (!certificate) {
      return res.status(404).json({ message: 'Sertifikat tidak ditemukan.' });
    }

    if (certificate.siswa_id !== siswaId) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    res
      .status(200)
      .json({ message: 'Berhasil mengambil sertifikat', data: certificate });
  } catch (error) {
    console.error('[CERTIFICATE-ERROR] Gagal mengambil sertifikat:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil sertifikat.' });
  }
};
