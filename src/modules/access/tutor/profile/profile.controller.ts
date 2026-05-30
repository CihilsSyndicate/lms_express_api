import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

export const getTutorProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const tutor = await prisma.tutor.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        gender: true,
        pekerjaan: true,
        whatsappNumber: true,
        lastEducation: true,
        institution: true,
        biografi: true,
        prodi: true,
        cvPathUrl: true,
        profileImg: true,
        role: true,
        socialMedias: {
          select: { platform: true, url: true },
        },
        signatures: {
          select: { fileUrl: true },
        },
      },
    });

    if (!tutor) {
      return res.status(404).json({ message: 'Tutor tidak ditemukan.' });
    }

    return res.status(200).json(tutor);
  } catch (error) {
    console.error('[TUTOR-PROFILE-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
