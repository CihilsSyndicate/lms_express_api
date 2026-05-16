import Router from 'express';
import { registerSiswa } from './siswa.controller';

export const pengelolaanSiswaRouter = Router();

pengelolaanSiswaRouter.post('/siswa', registerSiswa);
