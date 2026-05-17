import { Request, Response } from 'express';
import {
  deactivateStudentService,
  deleteStudentService,
  registerUserService,
  updateStudentProfileService,
} from '@/modules/auth/auth.service';

export const registerSiswa = async (req: Request, res: Response) => {
  try {
    const payload = await registerUserService(req.body, 'siswa');

    res.status(201).json(payload);
  } catch (error) {
    console.error('Error registering siswa:', error);

    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const updateSiswa = async (req: Request, res: Response) => {
  try {
    const payload = await updateStudentProfileService(
      req.params.id as string,
      req.body,
    );

    res.status(200).json(payload);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal memperbarui profil siswa.', error: error.message });
  }
};

export const deleteSiswa = async (req: Request, res: Response) => {
  try {
    const payload = await deleteStudentService(req.params.id as string);

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus siswa.', error });
  }
};

export const deactivateSiswa = async (req: Request, res: Response) => {
  try {
    const payload = await deactivateStudentService(req.params.id as string);
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menonaktifkan siswa.', error });
  }
};
