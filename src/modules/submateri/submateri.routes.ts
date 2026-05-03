import Router from 'express';
import {
  createSubmateri,
  getSubmateriByMateri,
  getSubmateriDetail,
  updateSubmateri,
  deleteSubmateri,
} from './submateri.controller';
import { verifyToken, requireRole } from '../../lib/auth';

const submateriRouter = Router();

submateriRouter.get('/materi/:materiId', verifyToken, getSubmateriByMateri);
submateriRouter.get('/:id', verifyToken, getSubmateriDetail);

submateriRouter.post('/', verifyToken, requireRole('tutor'), createSubmateri);
submateriRouter.put('/:id', verifyToken, requireRole('tutor'), updateSubmateri);
submateriRouter.delete(
  '/:id',
  verifyToken,
  requireRole('tutor'),
  deleteSubmateri,
);

export default submateriRouter;
