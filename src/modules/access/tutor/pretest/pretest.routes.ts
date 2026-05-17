import Router from 'express';
import {
  createPretest,
  addSoalPretest,
  getPretestByModul,
} from './pretest.controller';

const pretestRouter = Router();

pretestRouter.get('/:modulId', getPretestByModul);
pretestRouter.post('/', createPretest);
pretestRouter.post('/soal', addSoalPretest);

export default pretestRouter;
