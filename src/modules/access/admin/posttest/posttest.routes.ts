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
  deleteAllPosttestSoal,
  updatePosttestSettings,
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
posttestRouter.delete('/:posttestId/questions', deleteAllPosttestSoal);
posttestRouter.put('/settings/:posttestId', updatePosttestSettings);

export default posttestRouter;
