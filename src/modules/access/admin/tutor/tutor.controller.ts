import { prisma } from '@/lib/prisma';
import { Request, Response } from 'express';
import { AuthService } from '@/modules/auth/auth.service';
import { UpdateTutorRecord } from '@/validators/user/tutor.validator';

const authService = new AuthService();

export const registerTutor = async (req: Request, res: Response) => {
  try {
    const registeredTutor = await authService.registerUser(req.body, 'tutor');

    res.status(201).json({
      message: 'Tutor registered successfully',
      data: registeredTutor,
    });
  } catch (error) {
    console.error('Error registering tutor:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const updateTutor = async (req: Request, res: Response) => {
  try {
    const updatedTutor = await authService.updateTutorProfile(
      req.user?.id as string,
      req.body as UpdateTutorRecord,
    );

    res.status(200).json({
      message: 'Tutor profile updated successfully',
      data: updatedTutor,
    });
  } catch (error) {
    res.json({ message: 'Gagal memperbarui profil tutor.', error }).status(500);
  }
};

export const deleteTutor = async (req: Request, res: Response) => {
  try {
    const deletedTutor = await prisma.tutor.delete({
      where: {
        id: req.params.id as string,
      },
    });

    res.status(200).json({
      message: 'Tutor deleted successfully',
      data: deletedTutor,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus tutor.', error });
  }
};

export const deactivateTutor = async (req: Request, res: Response) => {
  try {
    const deactivatedTutor = await prisma.tutor.update({
      where: {
        id: req.params.id as string,
      },
      data: {
        isActive: false,
      },
    });

    res.status(200).json({
      message: 'Tutor deactivated successfully',
      data: deactivatedTutor,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menonaktifkan tutor.', error });
  }
};
