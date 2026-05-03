import Router from 'express';
import {
  createTopik,
  getTopikByModul,
  updateTopik,
  deleteTopik,
} from './topik.controller';
import { verifyToken, requireRole } from '../../lib/auth';

const topikRouter = Router();

topikRouter.get('/:modulId', verifyToken, getTopikByModul);

topikRouter.post('/', verifyToken, requireRole('tutor'), createTopik);
topikRouter.put('/:id', verifyToken, requireRole('tutor'), updateTopik);
topikRouter.delete('/:id', verifyToken, requireRole('tutor'), deleteTopik);

export default topikRouter;
