import { prisma } from '@/lib/prisma';
import { Request, Response } from 'express';
import { AuthService } from '@/modules/auth/auth.service';

const authService = new AuthService();

export const registerSiswa = async (req: Request, res: Response) => {
  try {
    const registeredSiswa = await authService.registerUser(req.body, 'siswa');

    res.status(201).json({
      message: 'Siswa registered successfully',
      data: registeredSiswa,
    });
  } catch (error) {
    console.error('Error registering siswa:', error);

    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const updateSiswa = async (req: Request, res: Response) => {
  try {
    const updatedSiswa = await authService.updateStudentProfile(
      req.user?.id as string,
      req.body,
    );

    res.status(200).json({
      message: 'Siswa profile updated successfully',
      data: updatedSiswa,
    });
  } catch (error) {
    res.json({ message: 'Gagal memperbarui profil siswa.', error }).status(500);
  }
};

export const deleteSiswa = async (req: Request, res: Response) => {
  try {
    const deletedSiswa = await prisma.siswa.delete({
      where: {
        id: req.params.id as string,
      },
    });

    res.status(200).json({
      message: 'Siswa deleted successfully',
      data: deletedSiswa,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus siswa.', error });
  }
};

export const deactivateSiswa = async (req: Request, res: Response) => {
  try {
    const deactivatedSiswa = await prisma.siswa.update({
      where: {
        id: req.params.id as string,
      },
      data: {
        isActive: false,
      },
    });
    res.status(200).json({
      message: 'Siswa deactivated successfully',
      data: deactivatedSiswa,
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menonaktifkan siswa.', error });
  }
};
