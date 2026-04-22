import Router from 'express';
import {
  getProgressByModule,
  getAllProgressForSiswa,
  markSubmateriCompleted,
} from '../controllers/progress';
import { verifyToken, requireRole } from '../lib/auth';

const progressRouter = Router();

progressRouter.get(
  '/',
  verifyToken,
  requireRole('siswa'),
  getAllProgressForSiswa,
);
progressRouter.get(
  '/:modulId',
  verifyToken,
  requireRole('siswa'),
  getProgressByModule,
);

progressRouter.post(
  '/submateri/:submateriId/complete',
  verifyToken,
  requireRole('siswa'),
  markSubmateriCompleted,
);

export default progressRouter;
