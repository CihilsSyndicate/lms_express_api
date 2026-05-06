import type { Express } from 'express';
import { NotFoundError } from '@/errors/app.error';
import { BKTService } from '@/modules/access/siswa/bkt/bkt.service';
import type {
  CreateModulRecord,
  UpdateModulRecord,
} from '@/validators/modul/modul.validator';
import {
  modulRepository,
  type ModulRecord,
  type ModulUpdateData,
  type ModulWithContents,
} from './modul.repository';
import { modulPolicy } from './modul.policy';

const bktService = new BKTService();

type GetModuleByIdParams = {
  moduleId: string;
  user: Express.User | undefined;
};

type CreateModuleParams = {
  payload: CreateModulRecord;
};

type UpdateModuleParams = {
  moduleId: string;
  tutorId: string | undefined;
  payload: UpdateModulRecord;
};

type DeleteModuleParams = {
  moduleId: string;
  tutorId: string | undefined;
};

export const modulService = {
  getModules() {
    return modulRepository.findMany();
  },

  async getModuleById({ moduleId, user }: GetModuleByIdParams) {
    const module = await modulRepository.findByIdWithContents(moduleId);

    if (!module) {
      throw new NotFoundError('Modul tidak ditemukan.');
    }

    if (user?.role === 'siswa') {
      return applyStudentUnlockState({
        module,
        studentId: user.id,
        moduleId,
      });
    }

    return module;
  },

  createModule({ payload }: CreateModuleParams) {
    return modulRepository.create(payload);
  },

  async updateModule({ moduleId, tutorId, payload }: UpdateModuleParams) {
    const module = await modulRepository.findById(moduleId);

    if (!module) {
      throw new NotFoundError('Modul tidak ditemukan.');
    }

    modulPolicy.ensureTutorOwnsModule({
      module,
      tutorId,
      action: 'update',
    });

    return modulRepository.updateById(
      moduleId,
      buildUpdatePayload(payload, module),
    );
  },

  async deleteModule({ moduleId, tutorId }: DeleteModuleParams) {
    const module = await modulRepository.findById(moduleId);

    if (!module) {
      throw new NotFoundError('Modul tidak ditemukan.');
    }

    modulPolicy.ensureTutorOwnsModule({
      module,
      tutorId,
      action: 'delete',
    });

    await modulRepository.deleteById(moduleId);

    return module;
  },
};

async function applyStudentUnlockState({
  module,
  studentId,
  moduleId,
}: {
  module: ModulWithContents;
  studentId: string;
  moduleId: string;
}) {
  const { unlockedSubmaterialIds, lockedSubmaterials } =
    await bktService.evaluateUnlockedContents(studentId, moduleId);

  return {
    ...module,
    materis: module.materis.map((materi) => ({
      ...materi,
      submateris: materi.submateris.map((submateri) => {
        const isLocked = !unlockedSubmaterialIds.includes(submateri.id);
        const lockInfo = lockedSubmaterials.find(
          (locked) => locked.id === submateri.id,
        );

        return {
          ...submateri,
          is_locked: isLocked,
          unlock_reason: lockInfo?.reason || null,
          required_mastery: lockInfo?.requiredMastery || null,
          current_mastery: lockInfo?.currentMastery || null,
        };
      }),
    })),
  };
}

function buildUpdatePayload(
  payload: UpdateModulRecord,
  module: ModulRecord,
): ModulUpdateData {
  return {
    nama_modul: payload.nama_modul ?? module.nama_modul,
    deskripsi: payload.deskripsi ?? module.deskripsi,
    target_waktu: payload.target_waktu ?? module.target_waktu,
    tingkat_kesulitan: payload.tingkat_kesulitan ?? module.tingkat_kesulitan,
    is_berbayar: payload.is_berbayar ?? module.is_berbayar,
    harga_modul:
      payload.harga_modul === undefined
        ? module.harga_modul === null
          ? null
          : Number(module.harga_modul)
        : payload.harga_modul,
    jenjang: payload.jenjang ?? module.jenjang,
    kelas_sekolah: payload.kelas_sekolah ?? module.kelas_sekolah,
  };
}
