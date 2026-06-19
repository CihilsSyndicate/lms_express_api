import { Request, Response } from 'express';
import { AppError } from '@/errors/app.error';
import { createRangkuman, updateRangkuman, deleteRangkuman } from '@/utils/rangkuman';

export const createRangkumanHandler = async (req: Request, res: Response) => {
  try {
    const result = await createRangkuman(req.body, req.user?.id, req.user?.role);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    console.error('[RANGKUMAN-ERROR] Gagal membuat rangkuman:', error);
    return res.status(500).json({ message: 'Internal server error saat membuat rangkuman.' });
  }
};

export const updateRangkumanHandler = async (req: Request, res: Response) => {
  try {
    const result = await updateRangkuman(req.params.id, req.body, req.user?.id, req.user?.role);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    console.error('[RANGKUMAN-ERROR] Gagal update rangkuman:', error);
    return res.status(500).json({ message: 'Internal server error saat update rangkuman.' });
  }
};

export const deleteRangkumanHandler = async (req: Request, res: Response) => {
  try {
    const result = await deleteRangkuman(req.params.id, req.user?.id, req.user?.role);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    console.error('[RANGKUMAN-ERROR] Gagal hapus rangkuman:', error);
    return res.status(500).json({ message: 'Internal server error saat hapus rangkuman.' });
  }
};
