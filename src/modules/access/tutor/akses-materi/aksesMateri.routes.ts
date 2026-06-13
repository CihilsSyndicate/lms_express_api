import { Router } from 'express';
import {
  listAksesMateri,
  addAksesMateri,
  editAksesMateri,
  removeAksesMateri,
} from './aksesMateri.controller';

const aksesMateriRouter = Router();

aksesMateriRouter.get('/pretest/:pretestId/access-rules', listAksesMateri);
aksesMateriRouter.post('/pretest/:pretestId/access-rules', addAksesMateri);
aksesMateriRouter.put('/access-rules/:id', editAksesMateri);
aksesMateriRouter.delete('/access-rules/:id', removeAksesMateri);

export default aksesMateriRouter;
