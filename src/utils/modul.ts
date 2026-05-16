import type {
  CreateModulRecord,
  UpdateModulRecord,
  Modul,
} from '@/validators/modul/modul.validator';
import { prisma } from '@/lib/prisma';

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

export const getModules = async () => {
  try {
    const modules = await prisma.modul.findMany({
      include: {
        tutor: { select: { fullName: true } },
        progress: {
          select: { siswaId: true },
        },
      },
    });

    return modules.map((modul) => ({
      ...modul,
      totalSiswa: modul.progress.length,
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
    return await prisma.modul.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    throw error;
  }
};
