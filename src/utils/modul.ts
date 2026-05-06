import { modulService } from '@/modules/learning/modules/modul.service';
import type {
  CreateModulRecord,
  UpdateModulRecord,
} from '@/validators/modul/modul.validator';

export const createModule = async (payload: CreateModulRecord) => {
  return modulService.createModule({ payload });
};

export const getModules = async () => {
  return modulService.getModules();
};

export const getModuleById = async (id: string) => {
  return modulService.getModuleById({ moduleId: id, user: undefined });
};

export const updateModule = async (
  payload: UpdateModulRecord,
  id: string,
  tutorId?: string,
) => {
  return modulService.updateModule({
    moduleId: id,
    tutorId,
    payload,
  });
};

export const deleteModule = async (id: string, tutorId?: string) => {
  return modulService.deleteModule({
    moduleId: id,
    tutorId,
  });
};
