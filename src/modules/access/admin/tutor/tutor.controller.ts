import { Request, Response } from 'express';
import {
  deactivateTutorService,
  deleteTutorService,
  registerUserService,
  updateTutorProfileService,
} from '@/modules/auth/auth.service';
import { UpdateTutorRecord } from '@/validators/user/tutor.validator';

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
    const payload = await updateTutorProfileService(
      req.params.id as string,
      req.body as UpdateTutorRecord,
    );

    res.status(200).json(payload);
  } catch (error: any) {
    res.status(500).json({ message: 'Gagal memperbarui profil tutor.', error: error.message });
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
