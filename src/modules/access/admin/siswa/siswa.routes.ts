import Router from 'express';
import {
  deactivateSiswa,
  deleteSiswa,
  registerSiswa,
  updateSiswa,
  getAllSiswa,
  activateSiswa,
} from './siswa.controller';

export const pengelolaanSiswaRouter = Router();

pengelolaanSiswaRouter.get('/', getAllSiswa);
pengelolaanSiswaRouter.post('/', registerSiswa);
pengelolaanSiswaRouter.put('/:id', updateSiswa);
pengelolaanSiswaRouter.delete('/:id', deleteSiswa);
pengelolaanSiswaRouter.patch('/:id/deactivate', deactivateSiswa);
pengelolaanSiswaRouter.patch('/:id/activate', activateSiswa);
