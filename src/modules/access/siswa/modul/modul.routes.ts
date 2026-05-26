import { Router } from 'express';
import { verifyToken } from '@/lib/auth';
import {
  getModulesController,
  getModuleByIdController,
  enrollModuleController,
} from './modul.controller';

const modulRouter = Router();

modulRouter.get('/', getModulesController);
modulRouter.get('/:id', verifyToken, getModuleByIdController);
modulRouter.post('/:id/enroll', verifyToken, enrollModuleController);

export default modulRouter;
