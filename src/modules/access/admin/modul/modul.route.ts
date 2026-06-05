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
  getModuleStudents,
} from './modul.controller';

export const adminModulRouter = Router();

adminModulRouter.get('/', getModules);
adminModulRouter.post('/', createModule);
adminModulRouter.post('/assign', assignStudentToModule);
adminModulRouter.delete('/assign', unassignStudentFromModule);
adminModulRouter.get('/assigned', findAssignedStudents);
adminModulRouter.delete('/unassign', unassignStudentFromModule);
adminModulRouter.get('/:modulId/siswa/all', getModuleStudents);
adminModulRouter.get('/:id', getModuleById);
adminModulRouter.put('/:id', updateModule);
adminModulRouter.delete('/:id', deleteModule);
