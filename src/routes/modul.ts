import Router from 'express';
import { verifyToken, requireRole } from '../lib/auth';
import {
  createModul,
  getSemuaModul,
  getModulById,
  updateModul,
  deleteModul
} from '../controllers/modul';

const modulRouter = Router();

modulRouter.get('/', getSemuaModul);
modulRouter.get('/:id', getModulById);

modulRouter.post('/', verifyToken, requireRole('tutor'), createModul);
modulRouter.put('/:id', verifyToken, requireRole('tutor'), updateModul);
modulRouter.delete('/:id', verifyToken, requireRole('tutor'), deleteModul);

export default modulRouter;
