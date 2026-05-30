import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        gender: true,
        whatsappNumber: true,
        profileImg: true,
        role: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin tidak ditemukan.' });
    }

    return res.status(200).json(admin);
  } catch (error) {
    console.error('[ADMIN-PROFILE-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
