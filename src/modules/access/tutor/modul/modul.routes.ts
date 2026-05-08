import Router from 'express';
import { verifyToken } from '@/lib/auth';
import {
  createModule,
  getModules,
  getModuleById,
  updateModule,
  deleteModule,
} from './modul.controller';

export const modulRouter = Router();

modulRouter.get('/', getModules);
modulRouter.get('/:id', getModuleById);
modulRouter.post('/', createModule);
modulRouter.put('/:id', updateModule);
modulRouter.delete('/:id', deleteModule);
