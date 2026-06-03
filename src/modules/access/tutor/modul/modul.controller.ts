import { Request, Response } from 'express';
import {
  getModuleById as getModuleByIdFunc,
  updateModule as updateModuleFunc,
  createModule as createModuleFunc,
  deleteModule as deleteModuleFunc,
  getModules as getModulesFunc,
  getTutorModules as getTutorModulesFunc,
} from '@/utils/modul';
import { parsePaginationQuery } from '@/utils/pagination';

export const getModules = async (req: Request, res: Response) => {
  try {
    const { limit, cursor } = parsePaginationQuery(req.query);
    const modules = await getModulesFunc(limit, cursor);
    res.status(200).json(modules);
  } catch (error: any) {
    console.error('Error fetching modules:', error);
    if (
      error.message === 'Invalid limit parameter' ||
      error.message === 'Invalid cursor'
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
};

export const getTutorModules = async (req: Request, res: Response) => {
  try {
    const tutorId = req.user?.id;
    const { limit, cursor } = parsePaginationQuery(req.query);
    const modules = await getTutorModulesFunc(tutorId as string, limit, cursor);
    res.status(200).json(modules);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching tutor modules:', error);
      res.status(500).json({
        error: 'Failed to fetch tutor modules',
        message: error.message,
      });
    }
  }
};

export const getModuleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const module = await getModuleByIdFunc(id as string);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.status(200).json(module);
  } catch (error) {
    console.error('Error fetching module by ID:', error);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
};

export const createModule = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const newModule = await createModuleFunc(payload);
    res.status(201).json(newModule);
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Failed to create module' });
  }
};

export const updateModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const tutorId = req.user?.id;

    const updatedModule = await updateModuleFunc(
      payload,
      id as string,
      tutorId,
    );
    if (!updatedModule) {
      return res
        .status(404)
        .json({ error: 'Module not found or unauthorized' });
    }
    res.status(200).json(updatedModule);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
};

export const deleteModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tutorId = req.user?.id;
    const payload = await deleteModuleFunc(id as string, tutorId);
    if (!payload) {
      return res
        .status(404)
        .json({ error: 'Module not found or unauthorized' });
    }
    res.status(200).json(payload);
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
};
