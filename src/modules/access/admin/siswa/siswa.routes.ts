import Router from 'express';
import {
  deactivateSiswa,
  deleteSiswa,
  registerSiswa,
  updateSiswa,
} from './siswa.controller';

export const pengelolaanSiswaRouter = Router();

pengelolaanSiswaRouter.post('/', registerSiswa);
pengelolaanSiswaRouter.put('/:id', updateSiswa);
pengelolaanSiswaRouter.delete('/:id', deleteSiswa);
pengelolaanSiswaRouter.patch('/:id/deactivate', deactivateSiswa);
