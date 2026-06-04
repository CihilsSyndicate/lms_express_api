import { Router } from 'express';
import {
  createPretest,
  addSoalPretest,
  getPretestByModul,
  getAllPretest,
  getPretestByIdHandler,
  updatePretest,
  deletePretest,
  updateSoalPretest,
  deleteSoalPretest,
  updatePretestSettings,
} from './pretest.controller';

const pretestRouter = Router();

pretestRouter.post('/', createPretest);
pretestRouter.get('/', getAllPretest);
pretestRouter.get('/detail/:pretestId', getPretestByIdHandler);
pretestRouter.get('/:modulId', getPretestByModul);
pretestRouter.put('/:id', updatePretest);
pretestRouter.delete('/:id', deletePretest);
pretestRouter.post('/soal', addSoalPretest);
pretestRouter.put('/soal/:soalId', updateSoalPretest);
pretestRouter.delete('/soal/:soalId', deleteSoalPretest);
pretestRouter.put('/settings/:pretestId', updatePretestSettings);

export default pretestRouter;
