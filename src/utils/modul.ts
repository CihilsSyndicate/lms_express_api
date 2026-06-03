import type {
  CreateModulRecord,
  UpdateModulRecord,
  Modul,
} from '@/validators/modul/modul.validator';
import { prisma } from '@/lib/prisma';
import {
  buildCursorPaginatedResponse,
  buildCursorWhere,
  decodeCursor,
} from './pagination';

export const createModule = async (payload: CreateModulRecord) => {
  try {
    const newModule = await prisma.modul.create({
      data: {
        ...payload,
        isPaid: payload.isPaid ?? false,
        level: payload.level ?? null,
        class: payload.class ?? null,
        modulPrice: payload.modulPrice ?? 0,
      },
    });

    return newModule;
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
};

export const getTutorModules = async (
  tutorId: string,
  limit: number = 10,
  cursor?: string,
) => {
  try {
    const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
    const where = buildCursorWhere(cursorPayload);
    const modules = await prisma.modul.findMany({
      where: {
        ...where,
        tutorId,
      },
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return buildCursorPaginatedResponse(modules, limit, (item) => ({
      createdAt: item.createdAt,
      id: item.id,
    }));
  } catch (error) {
    console.error('Error fetching tutor modules:', error);
    throw error;
  }
};

export const getModules = async (
  limit: number = 10,
  cursor?: string,
  modulType?: 'SISWA' | 'UMUM',
) => {
  try {
    const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
    const where = buildCursorWhere(cursorPayload);

    if (modulType) {
      (where as any).modulType = modulType;
    }

    const modules = await prisma.modul.findMany({
      where,
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        tutor: { select: { fullName: true } },
        progress: {
          select: { siswaId: true },
        },
      },
    });

    const items = modules.map((modul) => ({
      ...modul,
      totalSiswa: modul.progress.length,
    }));

    return buildCursorPaginatedResponse(items, limit, (item) => ({
      createdAt: item.createdAt,
      id: item.id,
    }));
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
};

export const getModuleById = async (id: string) => {
  try {
    const findModuleById = await prisma.modul.findUnique({
      where: { id },
      include: {
        tutor: { select: { fullName: true } },
      },
    });
    return findModuleById;
  } catch (error) {
    console.error('Error fetching module by ID:', error);
    throw error;
  }
};

export const updateModule = async (
  payload: UpdateModulRecord,
  id: string,
  tutorId?: string,
) => {
  try {
    const existingModule = await getModuleById(id);

    if (!existingModule) {
      throw new Error('Module not found');
    }
    if (tutorId && existingModule.tutorId !== tutorId) {
      throw new Error('Unauthorized to update this module');
    }

    if (payload?.isPaid && Number(payload?.modulPrice) < 1) {
      throw new Error(
        'Module price must be a positive number if the module is paid',
      );
    }
    const updatedModule = await prisma.modul.update({
      where: { id },
      data: {
        ...payload,
        modulType: payload.modulType ?? existingModule.modulType,
        subtitle: payload.subtitle ?? existingModule.subtitle,
        moduleName: payload.moduleName ?? existingModule.moduleName,
        description: payload.description ?? existingModule.description,
        targetTime: payload.targetTime ?? existingModule.targetTime,
        difficulty: payload.difficulty ?? existingModule.difficulty,
        isPaid: payload.isPaid ?? existingModule.isPaid,
        modulPrice: payload.modulPrice ?? existingModule.modulPrice,
        level: payload.level ?? existingModule.level,
        class: payload.class ?? existingModule.class,
        pretestId: payload.pretestId ?? existingModule.pretestId,
        posttestId: payload.posttestId ?? existingModule.posttestId,
      },
    });

    return updatedModule;
  } catch (error) {
    console.error('Error updating module:', error);
    throw error;
  }
};

export const deleteModule = async (id: string, tutorId?: string) => {
  try {
    const existingModule = await getModuleById(id);
    if (!existingModule) {
      throw new Error('Module not found');
    }
    if (tutorId && existingModule.tutorId !== tutorId) {
      throw new Error('Unauthorized to delete this module');
    }

    await prisma.modul.delete({
      where: { id },
    });

    return { message: 'Module deleted successfully' };
  } catch (error) {
    console.error('Error deleting module:', error);
    throw error;
  }
};

export const assignStudentToModule = async (
  moduleId: string,
  studentId: string,
) => {
  return prisma.progress.create({
    data: {
      modulId: moduleId,
      siswaId: studentId,
      progressPercentage: 0,
    },
  });
};

export const unassignStudentFromModule = async (
  moduleId: string,
  studentId: string,
) => {
  try {
    const findAssigned = await findAssignedStudents(moduleId, studentId);
    if (findAssigned.length < 1) {
      throw new Error(
        'Student is not assigned to this module or progress not found',
      );
    }

    const deleteProgress = await prisma.progress.deleteMany({
      where: {
        modulId: moduleId,
        siswaId: studentId,
      },
    });

    return deleteProgress;
  } catch (error) {
    console.error('Error unassigning student from module:', error);
    throw error;
  }
};

export const findAssignedStudents = async (
  moduleId: string,
  studentId: string,
) => {
  try {
    const assignedStudents = await prisma.progress.findMany({
      where: {
        modulId: moduleId,
        siswaId: studentId,
      },
      select: { siswaId: true },
    });
    return assignedStudents;
  } catch (error) {
    console.error('Error finding assigned students:', error);
    throw error;
  }
};
