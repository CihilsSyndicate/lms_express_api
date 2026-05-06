import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@/errors/app.error';
import {
  createModulSchema,
  updateModulSchema,
} from '@/validators/modul/modul.validator';
import { modulService } from './modul.service';

type ModuleAction = 'get' | 'create' | 'update' | 'delete';

export const createModule = async (req: Request, res: Response) => {
  try {
    const tutorId = req.user?.id;

    if (!tutorId) {
      return res.status(401).json({ message: 'Akses ditolak.' });
    }

    const payload = createModulSchema.parse({
      ...req.body,
      tutor_id: tutorId,
    });
    const newModule = await modulService.createModule({ payload });

    return res
      .status(201)
      .json({ message: 'Modul berhasil dibuat', data: newModule });
  } catch (error) {
    return handleModulError(error, res, 'create');
  }
};

export const getModules = async (_req: Request, res: Response) => {
  try {
    const modules = await modulService.getModules();

    return res
      .status(200)
      .json({ message: 'Berhasil mengambil data modul', data: modules });
  } catch (error) {
    return handleModulError(error, res, 'get');
  }
};

export const getModuleById = async (req: Request, res: Response) => {
  try {
    const module = await modulService.getModuleById({
      moduleId: req.params.id as string,
      user: req.user,
    });

    return res
      .status(200)
      .json({ message: 'Berhasil mengambil data modul', data: module });
  } catch (error) {
    return handleModulError(error, res, 'get');
  }
};

export const updateModule = async (req: Request, res: Response) => {
  try {
    const payload = updateModulSchema.parse(req.body);
    const updatedModule = await modulService.updateModule({
      moduleId: req.params.id as string,
      tutorId: req.user?.id,
      payload,
    });

    return res
      .status(200)
      .json({ message: 'Modul berhasil diupdate', data: updatedModule });
  } catch (error) {
    return handleModulError(error, res, 'update');
  }
};

export const deleteModule = async (req: Request, res: Response) => {
  try {
    await modulService.deleteModule({
      moduleId: req.params.id as string,
      tutorId: req.user?.id,
    });

    return res.status(200).json({ message: 'Modul berhasil dihapus' });
  } catch (error) {
    return handleModulError(error, res, 'delete');
  }
};

function handleModulError(error: unknown, res: Response, action: ModuleAction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Payload modul tidak valid.',
      errors: error.issues,
    });
  }

  console.error(getLogMessage(action), error);

  return res.status(500).json({ message: getInternalErrorMessage(action) });
}

function getLogMessage(action: ModuleAction) {
  const messages: Record<ModuleAction, string> = {
    create: '[MODUL-ERROR] Gagal membuat modul:',
    get: '[MODUL-ERROR] Gagal mengambil modul:',
    update: '[MODUL-ERROR] Gagal update modul:',
    delete: '[MODUL-ERROR] Gagal hapus modul:',
  };

  return messages[action];
}

function getInternalErrorMessage(action: ModuleAction) {
  const messages: Record<ModuleAction, string> = {
    create: 'Internal server error saat membuat modul.',
    get: 'Internal server error saat mengambil modul.',
    update: 'Internal server error saat update modul.',
    delete: 'Internal server error saat menghapus modul.',
  };

  return messages[action];
}
