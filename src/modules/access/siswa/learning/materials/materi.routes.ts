import Router from 'express';
import {
  createMaterial,
  getMaterialsByModule,
  updateMaterial,
  deleteMaterial,
} from './materi.controller';
import { verifyToken, requireRole } from '../../../lib/auth';

const materiRouter = Router();

materiRouter.get('/:modulId', verifyToken, getMaterialsByModule);

materiRouter.post('/', verifyToken, requireRole('tutor'), createMaterial);
materiRouter.put('/:id', verifyToken, requireRole('tutor'), updateMaterial);
materiRouter.delete('/:id', verifyToken, requireRole('tutor'), deleteMaterial);

export default materiRouter;
