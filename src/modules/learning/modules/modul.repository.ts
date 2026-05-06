import { prisma } from '@/lib/prisma';
import type { CreateModulRecord } from '@/validators/modul/modul.validator';

export type ModulUpdateData = {
  nama_modul: string;
  deskripsi: string;
  target_waktu: number;
  tingkat_kesulitan: string;
  is_berbayar: boolean;
  harga_modul: number | null;
  jenjang: string;
  kelas_sekolah: string;
};

export const modulRepository = {
  findMany() {
    return prisma.modul.findMany({
      include: {
        tutor: { select: { nama_lengkap: true } },
      },
    });
  },

  findById(moduleId: string) {
    return prisma.modul.findUnique({
      where: { id: moduleId },
    });
  },

  findByIdWithContents(moduleId: string) {
    return prisma.modul.findUnique({
      where: { id: moduleId },
      include: {
        tutor: { select: { nama_lengkap: true } },
        materis: {
          include: {
            submateris: true,
          },
        },
        topiks: true,
      },
    });
  },

  create(payload: CreateModulRecord) {
    return prisma.modul.create({
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
  },

  updateById(moduleId: string, payload: ModulUpdateData) {
    return prisma.modul.update({
      where: { id: moduleId },
      data: payload,
    });
  },

  deleteById(moduleId: string) {
    return prisma.modul.delete({
      where: { id: moduleId },
    });
  },
};

export type ModulRecord = NonNullable<
  Awaited<ReturnType<typeof modulRepository.findById>>
>;

export type ModulWithContents = NonNullable<
  Awaited<ReturnType<typeof modulRepository.findByIdWithContents>>
>;
