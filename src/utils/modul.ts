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
        nama_modul: payload.nama_modul,
        deskripsi: payload.deskripsi,
        target_waktu: payload.target_waktu,
        tingkat_kesulitan: payload.tingkat_kesulitan,
        is_berbayar: payload.is_berbayar,
        harga_modul: payload.harga_modul ?? null,
        jenjang: payload.jenjang,
        kelas_sekolah: payload.kelas_sekolah,
        tutor_id: payload.tutor_id,
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
        tutor: { select: { nama_lengkap: true } },
      },
    });

    return modules;
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
        tutor: { select: { nama_lengkap: true } },
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
    const updatedModule = await prisma.modul.update({
      where: { id: id, tutor_id: tutorId as string },
      data: {
        nama_modul: payload.nama_modul ?? existingModule.nama_modul,
        deskripsi: payload.deskripsi ?? existingModule.deskripsi,
        target_waktu: payload.target_waktu ?? existingModule.target_waktu,
        tingkat_kesulitan:
          payload.tingkat_kesulitan ?? existingModule.tingkat_kesulitan,
        is_berbayar: payload.is_berbayar ?? existingModule.is_berbayar,
        harga_modul:
          payload.harga_modul === undefined
            ? existingModule.harga_modul === null
              ? null
              : Number(existingModule.harga_modul)
            : payload.harga_modul,
        jenjang: payload.jenjang ?? existingModule.jenjang,
        kelas_sekolah: payload.kelas_sekolah ?? existingModule.kelas_sekolah,
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
