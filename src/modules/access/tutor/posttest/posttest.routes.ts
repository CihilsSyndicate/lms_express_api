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
  deleteAllPosttestSoal,
  updateTutorPosttestSettings,
} from './posttest.controller';
import {
  listAksesMateri,
  addAksesMateri,
  editAksesMateri,
  removeAksesMateri,
} from '../akses-materi/aksesMateri.controller';

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
posttestRouter.delete('/:posttestId/questions', deleteAllPosttestSoal);
posttestRouter.put('/settings/:posttestId', updateTutorPosttestSettings);
posttestRouter.get('/:posttestId/access-rules', listAksesMateri);
posttestRouter.post('/:posttestId/access-rules', addAksesMateri);
posttestRouter.put('/access-rules/:id', editAksesMateri);
posttestRouter.delete('/access-rules/:id', removeAksesMateri);

export default posttestRouter;
