import { Router } from 'express';
import {
  assignStudentToModule,
  createModule,
  deleteModule,
  getModuleById,
  getModules,
  unassignStudentFromModule,
  updateModule,
} from './modul.controller';

export const adminModulRouter = Router();

adminModulRouter.get('/', getModules);
adminModulRouter.post('/', createModule);
adminModulRouter.post('/assign', assignStudentToModule);
adminModulRouter.delete('/assign', unassignStudentFromModule);
adminModulRouter.get('/:id', getModuleById);
adminModulRouter.put('/:id', updateModule);
adminModulRouter.delete('/:id', deleteModule);
