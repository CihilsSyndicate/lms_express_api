import Router from 'express';
import {
  createSubmaterial,
  getSubmaterialsByMaterial,
  getSubmaterialDetail,
  updateSubmaterial,
  deleteSubmaterial,
} from './submateri.controller';
import { verifyToken, requireRole } from '../../../lib/auth';

const submateriRouter = Router();

submateriRouter.get(
  '/materi/:materiId',
  verifyToken,
  getSubmaterialsByMaterial,
);
submateriRouter.get('/:id', verifyToken, getSubmaterialDetail);

submateriRouter.post('/', verifyToken, requireRole('tutor'), createSubmaterial);
submateriRouter.put(
  '/:id',
  verifyToken,
  requireRole('tutor'),
  updateSubmaterial,
);
submateriRouter.delete(
  '/:id',
  verifyToken,
  requireRole('tutor'),
  deleteSubmaterial,
);

export default submateriRouter;
