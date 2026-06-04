import { Router } from 'express';
import {
  createPosttest,
  addSoalPosttest,
  getPosttestByModul,
  getAllPosttest,
  getPosttestByIdHandler,
  updatePosttest,
  deletePosttest,
  updateSoalPosttest,
  deleteSoalPosttest,
} from './posttest.controller';

const posttestRouter = Router();

posttestRouter.post('/', createPosttest);
posttestRouter.get('/', getAllPosttest);
posttestRouter.get('/detail/:posttestId', getPosttestByIdHandler);
posttestRouter.get('/:modulId', getPosttestByModul);
posttestRouter.put('/:id', updatePosttest);
posttestRouter.delete('/:id', deletePosttest);
posttestRouter.post('/soal', addSoalPosttest);
posttestRouter.put('/soal/:soalId', updateSoalPosttest);
posttestRouter.delete('/soal/:soalId', deleteSoalPosttest);

export default posttestRouter;
