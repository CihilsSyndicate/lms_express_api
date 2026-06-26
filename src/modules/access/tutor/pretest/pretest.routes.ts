import Router from 'express';
import {
  createPretest,
  addSoalPretest,
  getPretestByModul,
  getAllTutorPretest,
  getTutorPretestById,
  updateTutorPretest,
  deleteTutorPretest,
  updateSoalPretest,
  deleteSoalPretest,
  deleteAllPretestSoal,
  updateTutorPretestSettings,
} from './pretest.controller';
import {
  listAksesMateri,
  addAksesMateri,
  editAksesMateri,
  removeAksesMateri,
} from '../akses-materi/aksesMateri.controller';

const pretestRouter = Router();

pretestRouter.post('/', createPretest);
pretestRouter.get('/', getAllTutorPretest);
pretestRouter.get('/detail/:pretestId', getTutorPretestById);
pretestRouter.get('/:modulId', getPretestByModul);
pretestRouter.put('/:id', updateTutorPretest);
pretestRouter.delete('/:id', deleteTutorPretest);
pretestRouter.post('/soal', addSoalPretest);
pretestRouter.put('/soal/:soalId', updateSoalPretest);
pretestRouter.delete('/soal/:soalId', deleteSoalPretest);
pretestRouter.delete('/:pretestId/questions', deleteAllPretestSoal);
pretestRouter.put('/settings/:pretestId', updateTutorPretestSettings);
pretestRouter.get('/:pretestId/access-rules', listAksesMateri);
pretestRouter.post('/:pretestId/access-rules', addAksesMateri);
pretestRouter.put('/access-rules/:id', editAksesMateri);
pretestRouter.delete('/access-rules/:id', removeAksesMateri);

export default pretestRouter;
