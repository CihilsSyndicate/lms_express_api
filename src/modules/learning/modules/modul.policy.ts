import { ForbiddenError } from '@/errors/app.error';
import type { ModulRecord } from './modul.repository';

type ModuleAction = 'update' | 'delete';

export const modulPolicy = {
  ensureTutorOwnsModule({
    module,
    tutorId,
    action,
  }: {
    module: ModulRecord;
    tutorId: string | undefined;
    action: ModuleAction;
  }) {
    if (module.tutor_id === tutorId) {
      return;
    }

    const message =
      action === 'delete'
        ? 'Akses ditolak. Anda tidak berhak menghapus modul ini.'
        : 'Akses ditolak. Anda tidak berhak mengubah modul ini.';

    throw new ForbiddenError(message);
  },
};
