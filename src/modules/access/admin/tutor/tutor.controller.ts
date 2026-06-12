import { Request, Response } from 'express';
import {
  deactivateTutorService,
  deleteTutorService,
  registerUserService,
} from '@/modules/auth/auth.service';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const searchTutor = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      return res
        .status(400)
        .json({ message: 'Kata kunci minimal 2 karakter.' });
    }

    const tutors = await prisma.tutor.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { id: 'desc' },
    });

    return res.status(200).json(tutors);
  } catch (error) {
    console.error('[SEARCH-TUTOR-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllTutors = async (req: Request, res: Response) => {
  try {
    const tutors = await prisma.tutor.findMany();
    res.status(200).json(tutors);
  } catch (error: unknown) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const registerTutor = async (req: Request, res: Response) => {
  try {
    const payload = await registerUserService(req.body, 'tutor');

    res.status(201).json(payload);
  } catch (error) {
    console.error('Error registering tutor:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const updateTutor = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { password } = req.body;

    let hashedPassword;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    const filteredData = Object.fromEntries(
      Object.entries(req.body).filter(([, value]) => value !== undefined),
    );

    const updatedTutor = await prisma.tutor.update({
      where: { id },
      data: {
        ...filteredData,
        password: hashedPassword as string,
      },
    });

    res.status(200).json(updatedTutor);
  } catch (error: any) {
    res.status(500).json({
      message: 'Gagal memperbarui profil tutor.',
      error: error.message,
    });
  }
};

export const deleteTutor = async (req: Request, res: Response) => {
  try {
    const payload = await deleteTutorService(req.params.id as string);

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus tutor.', error });
  }
};

export const deactivateTutor = async (req: Request, res: Response) => {
  try {
    const payload = await deactivateTutorService(req.params.id as string);

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menonaktifkan tutor.', error });
  }
};
