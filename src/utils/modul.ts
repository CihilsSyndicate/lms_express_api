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
        moduleName: payload.nama_modul,
        description: payload.deskripsi,
        subtitle: payload.subtitle,
        targetTime: payload.target_waktu,
        difficulty: payload.tingkat_kesulitan,
        isPaid: payload.is_berbayar,
        modulPrice: payload.harga_modul ?? null,
        level: payload.jenjang,
        class: payload.kelas_sekolah,
        tutorId: payload.tutor_id,
      },
    });

    return newModule;
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
};

export const getModules = async (limit: number = 10, cursor?: string) => {
  try {
    const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
    const where = buildCursorWhere(cursorPayload);

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

    const updatedModule = await prisma.modul.update({
      where: { id },
      data: {
        moduleName: payload.nama_modul ?? existingModule.moduleName,
        description: payload.deskripsi ?? existingModule.description,
        targetTime: payload.target_waktu ?? existingModule.targetTime,
        difficulty: payload.tingkat_kesulitan ?? existingModule.difficulty,
        isPaid: payload.is_berbayar ?? existingModule.isPaid,
        modulPrice:
          payload.harga_modul === undefined
            ? existingModule.modulPrice === null
              ? null
              : Number(existingModule.modulPrice as any)
            : payload.harga_modul,
        level: payload.jenjang ?? existingModule.level,
        class: payload.kelas_sekolah ?? (existingModule as any).class,
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
  await prisma.progress.deleteMany({
    where: {
      modulId: moduleId,
      siswaId: studentId,
    },
  });

  return { message: 'Student unassigned from module successfully' };
};
