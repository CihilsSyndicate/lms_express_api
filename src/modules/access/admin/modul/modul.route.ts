import { Router } from 'express';
import {
  assignStudentToModule,
  createModule,
  deleteModule,
  getModuleById,
  getModules,
  unassignStudentFromModule,
  updateModule,
  findAssignedStudents,
} from './modul.controller';

export const adminModulRouter = Router();

adminModulRouter.get('/', getModules);
adminModulRouter.post('/', createModule);
adminModulRouter.post('/assign', assignStudentToModule);
adminModulRouter.get('/assigned', findAssignedStudents);
adminModulRouter.delete('/unassign', unassignStudentFromModule);
adminModulRouter.get('/:id', getModuleById);
adminModulRouter.put('/:id', updateModule);
adminModulRouter.delete('/:id', deleteModule);
