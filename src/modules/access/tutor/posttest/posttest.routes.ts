import Router from 'express';
import {
  createPosttest,
  addSoalPosttest,
  getPosttestByModul,
  submitPosttest,
} from './posttest.controller';
import { verifyToken, requireRole } from '../../lib/auth';

const posttestRouter = Router();

posttestRouter.get('/:modulId', verifyToken, getPosttestByModul);

posttestRouter.post('/', verifyToken, requireRole('tutor'), createPosttest);
posttestRouter.post(
  '/soal',
  verifyToken,
  requireRole('tutor'),
  addSoalPosttest,
);
posttestRouter.post(
  '/:modulId/submit',
  verifyToken,
  requireRole('siswa'),
  submitPosttest,
);

export default posttestRouter;
