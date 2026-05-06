import Router from 'express';
import { registerSiswa } from '@/modules/access/siswa/profile/siswa.controller';

export const pengelolaanSiswaRouter = Router();

// pengelolaanSiswaRouter.get('/siswa', getAllSiswa);
pengelolaanSiswaRouter.post('/siswa', registerSiswa);
// pengelolaanSiswaRouter.get('/siswa/:id', getSiswaById);
// pengelolaanSiswaRouter.put('/siswa/:id', updateSiswa);
// pengelolaanSiswaRouter.delete('/siswa/:id', deleteSiswa);
