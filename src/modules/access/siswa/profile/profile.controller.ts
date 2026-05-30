import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

export const getSiswaProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const siswa = await prisma.siswa.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nama_lengkap: true,
        email: true,
        jenjang: true,
        kelas_sekolah: true,
        profileImage: true,
        role: true,
        studentType: true,
        createdAt: true,
      },
    });

    if (!siswa) {
      return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
    }

    return res.status(200).json(siswa);
  } catch (error) {
    console.error('[SISWA-PROFILE-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
