import Router from 'express';
import { verifyToken, requireRole } from '@/lib/auth';
import {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
} from '@/modules/learning/modules/modul.controller';

const modulRouter = Router();

modulRouter.get('/', getModules);

modulRouter.get('/:id', verifyToken, getModuleById);

modulRouter.post('/', verifyToken, requireRole('tutor'), createModule);
modulRouter.put('/:id', verifyToken, requireRole('tutor'), updateModule);
modulRouter.delete('/:id', verifyToken, requireRole('tutor'), deleteModule);

export default modulRouter;
