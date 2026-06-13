import { Request, Response } from 'express';
import {
  getAksesMateriByPretest,
  createAksesMateri,
  updateAksesMateri,
  deleteAksesMateri,
} from '@/utils/aksesMateri';
import { createAksesMateriSchema, updateAksesMateriSchema } from '@/validators/aksesMateri/aksesMateri.validator';
import { AppError } from '@/errors/app.error';

export const listAksesMateri = async (req: Request, res: Response) => {
  try {
    const { pretestId } = req.params;
    const rules = await getAksesMateriByPretest(pretestId);
    return res.status(200).json(rules);
  } catch (error) {
    console.error('[AKSES-MATERI] List error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Gagal memuat aturan akses materi.' });
  }
};

export const addAksesMateri = async (req: Request, res: Response) => {
  try {
    const { pretestId } = req.params;
    const parsed = createAksesMateriSchema.parse({ ...req.body, pretestId });
    const rule = await createAksesMateri(parsed, req.user?.id);
    return res.status(201).json(rule);
  } catch (error) {
    console.error('[AKSES-MATERI] Create error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Gagal membuat aturan akses materi.' });
  }
};

export const editAksesMateri = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = updateAksesMateriSchema.parse(req.body);
    const rule = await updateAksesMateri(id, parsed, req.user?.id);
    return res.status(200).json(rule);
  } catch (error) {
    console.error('[AKSES-MATERI] Update error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Gagal memperbarui aturan akses materi.' });
  }
};

export const removeAksesMateri = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteAksesMateri(id, req.user?.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[AKSES-MATERI] Delete error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Gagal menghapus aturan akses materi.' });
  }
};
