import Router from 'express';
import {
  createPosttest,
  addSoalPosttest,
  getPosttestByModul,
} from './posttest.controller';

const posttestRouter = Router();

posttestRouter.get('/:modulId', getPosttestByModul);
posttestRouter.post('/', createPosttest);
posttestRouter.post('/soal', addSoalPosttest);

export default posttestRouter;
