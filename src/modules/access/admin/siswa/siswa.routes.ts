import Router from 'express';
import { registerSiswa } from '@/modules/access/siswa/profile/siswa.controller';

export const pengelolaanSiswaRouter = Router();

pengelolaanSiswaRouter.post('/siswa', registerSiswa);
