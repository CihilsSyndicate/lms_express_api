import { prisma } from '@/lib/prisma';
import { Request, Response } from 'express';
import {
  getModuleById as getModuleByIdFunc,
  updateModule as updateModuleFunc,
  createModule as createModuleFunc,
  deleteModule as deleteModuleFunc,
  getModules as getModulesFunc,
} from '@/utils/modul';

export const assignStudentToModule = async (req: Request, res: Response) => {
  try {
    const { moduleId, studentId } = req.body;

    const assignToProgress = await prisma.progress.create({
      data: {
        modulId: moduleId as string,
        siswaId: studentId as string,
        progressPercentage: 0,
      },
    });

    res
      .json({
        message: 'Student assigned to module successfully',
        data: assignToProgress,
      })
      .status(200);
  } catch (error) {
    console.error('Error assigning student to module:', error);
    res
      .status(500)
      .json({ error: 'Failed to assign student to module', message: error });
  }
};

export const getModules = async (req: Request, res: Response) => {
  try {
    const modules = await getModulesFunc();
    res.json(modules).status(200);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
};

export const getModuleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const module = await getModuleByIdFunc(id as string);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.json(module).status(200);
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
    res.json(updatedModule).status(200);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
};

export const deleteModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tutorId = req.user?.id;
    const deletedModule = await deleteModuleFunc(id as string, tutorId);
    if (!deletedModule) {
      return res
        .status(404)
        .json({ error: 'Module not found or unauthorized' });
    }
    res.json({ message: 'Module deleted successfully' }).status(200);
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
};
