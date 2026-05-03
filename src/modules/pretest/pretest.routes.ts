import Router from 'express';
import {
  createPretest,
  addSoalPretest,
  getPretestByModul,
  submitPretest,
} from './pretest.controller';
import { verifyToken, requireRole } from '../../lib/auth';

const pretestRouter = Router();

pretestRouter.get('/:modulId', verifyToken, getPretestByModul);

pretestRouter.post('/', verifyToken, requireRole('tutor'), createPretest);
pretestRouter.post('/soal', verifyToken, requireRole('tutor'), addSoalPretest);
pretestRouter.post(
  '/:modulId/submit',
  verifyToken,
  requireRole('siswa'),
  submitPretest,
);

export default pretestRouter;
