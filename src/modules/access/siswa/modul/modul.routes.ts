import { Router } from 'express';
import { verifyToken } from '@/lib/auth';
import {
  getModulesController,
  getModuleByIdController,
} from './modul.controller';

const modulRouter = Router();

modulRouter.get('/', getModulesController);
modulRouter.get('/:id', verifyToken, getModuleByIdController);

export default modulRouter;
