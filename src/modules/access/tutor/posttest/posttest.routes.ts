import Router from 'express';
import {
  createPosttest,
  addSoalPosttest,
  getPosttestByModul,
  getAllTutorPosttest,
  getTutorPosttestById,
  updateTutorPosttest,
  deleteTutorPosttest,
  updateSoalPosttest,
  deleteSoalPosttest,
  updateTutorPosttestSettings,
} from './posttest.controller';

const posttestRouter = Router();

posttestRouter.post('/', createPosttest);
posttestRouter.get('/', getAllTutorPosttest);
posttestRouter.get('/detail/:posttestId', getTutorPosttestById);
posttestRouter.get('/:modulId', getPosttestByModul);
posttestRouter.put('/:id', updateTutorPosttest);
posttestRouter.delete('/:id', deleteTutorPosttest);
posttestRouter.post('/soal', addSoalPosttest);
posttestRouter.put('/soal/:soalId', updateSoalPosttest);
posttestRouter.delete('/soal/:soalId', deleteSoalPosttest);
posttestRouter.put('/settings/:posttestId', updateTutorPosttestSettings);

export default posttestRouter;
