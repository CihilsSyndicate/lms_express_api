import { Request, Response } from 'express';
import {
  assignStudentToModule as assignStudentToModuleFunc,
  getModuleById as getModuleByIdFunc,
  updateModule as updateModuleFunc,
  createModule as createModuleFunc,
  deleteModule as deleteModuleFunc,
  getModules as getModulesFunc,
  unassignStudentFromModule as unassignStudentFromModuleFunc,
  findAssignedStudents as findAssignedStudentsFunc,
  getModuleStudents as getModuleStudentsFunc,
} from '@/utils/modul';

import { parsePaginationQuery } from '@/utils/pagination';
import { getUserById as getStudentById } from '@/utils/user';
import { pushNotification } from '@/utils/realtime';

export const findAssignedStudents = async (req: Request, res: Response) => {
  try {
    const { moduleId, studentId } = req.body;
    const students = await findAssignedStudentsFunc(moduleId, studentId);

    res.status(200).json(students);
  } catch (error) {
    console.error('Error finding assigned students:', error);
    res.status(500).json({ error: 'Failed to find assigned students' });
  }
};

export const getModuleStudents = async (req: Request, res: Response) => {
  try {
    const modulId = req.params.modulId as string;
    if (!modulId) {
      return res.status(400).json({ error: 'Module ID is required' });
    }
    const { limit, cursor } = parsePaginationQuery(req.query);
    const result = await getModuleStudentsFunc(modulId, limit, cursor);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching module students:', error);
    res.status(500).json({ error: 'Failed to fetch module students' });
  }
};

export const assignStudentToModule = async (req: Request, res: Response) => {
  try {
    const { moduleId, studentId } = req.body;

    const existingAssignment = await findAssignedStudentsFunc(
      moduleId,
      studentId,
    );

    if (existingAssignment.length > 0) {
      return res
        .status(400)
        .json({ error: 'Student is already assigned to this module' });
    }

    const findStudent = await getStudentById(studentId, 'siswa');

    if (!findStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const findModule = await getModuleByIdFunc(moduleId);

    if (!findModule) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const payload = await assignStudentToModuleFunc(moduleId, studentId);

    // await pushNotification(
    //   studentId,
    //   'enrollment',
    //   'Ditambahkan ke Modul',
    //   `Admin menambahkan Anda ke modul "${findModule.moduleName}".`,
    // );

    res.status(200).json(payload);
  } catch (error) {
    console.error('Error assigning student to module:', error);
    res.status(500).json({
      error: 'Failed to assign student to module',
      message: (error as Error).message,
    });
  }
};

export const unassignStudentFromModule = async (
  req: Request,
  res: Response,
) => {
  try {
    const { moduleId, studentId } = req.body;
    const result = await unassignStudentFromModuleFunc(moduleId, studentId);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error unassigning student from module:', error);
    res.status(500).json({
      error: 'Failed to unassign student from module',
      message: (error as Error).message,
    });
  }
};

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
    // const tutorId = req.user?.id;

    const updatedModule = await updateModuleFunc(
      payload,
      id as string,
      payload.tutorId,
    );
    if (!updatedModule) {
      return res
        .status(404)
        .json({ error: 'Module not found or unauthorized' });
    }
    res.status(200).json(updatedModule);
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({
      error: 'Failed to update module',
      message: (error as Error).message,
    });
  }
};

export const deleteModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tutorId = req.body.tutorId;

    const findModule = await getModuleByIdFunc(id as string);
    if (!findModule) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const deleteBook = await deleteModuleFunc(id as string, tutorId);
    if (!deleteBook) {
      return res
        .status(404)
        .json({ error: 'Module not found or unauthorized' });
    }

    res.status(200).json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({
      error: 'Failed to delete module',
      message: (error as Error).message,
    });
  }
};
