import { Router } from 'express';
import {
  listAksesMateri,
  addAksesMateri,
  editAksesMateri,
  removeAksesMateri,
} from './aksesMateri.controller';

const aksesMateriRouter = Router();

aksesMateriRouter.get('/:type/:assessmentId/access-rules', listAksesMateri);
aksesMateriRouter.post('/:type/:assessmentId/access-rules', addAksesMateri);
aksesMateriRouter.put('/access-rules/:id', editAksesMateri);
aksesMateriRouter.delete('/access-rules/:id', removeAksesMateri);

export default aksesMateriRouter;
