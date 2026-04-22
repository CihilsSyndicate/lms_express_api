import Router from 'express';
import {
  createModul,
  getSemuaModul,
  getModulById,
  updateModul,
  deleteModul
} from '../controllers/modul';
import { verifyToken, requireRole } from '../lib/auth';

const modulRouter = Router();

modulRouter.get('/', getSemuaModul);

modulRouter.get('/:id', verifyToken, getModulById);

modulRouter.post('/', verifyToken, requireRole('tutor'), createModul);
modulRouter.put('/:id', verifyToken, requireRole('tutor'), updateModul);
modulRouter.delete('/:id', verifyToken, requireRole('tutor'), deleteModul);

export default modulRouter;
