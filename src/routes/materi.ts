import Router from 'express';
import {
  createMateri,
  getMateriByModul,
  updateMateri,
  deleteMateri,
} from '../controllers/materi';
import { verifyToken, requireRole } from '../lib/auth';

const materiRouter = Router();

materiRouter.get('/:modulId', verifyToken, getMateriByModul);

materiRouter.post('/', verifyToken, requireRole('tutor'), createMateri);
materiRouter.put('/:id', verifyToken, requireRole('tutor'), updateMateri);
materiRouter.delete('/:id', verifyToken, requireRole('tutor'), deleteMateri);

export default materiRouter;
