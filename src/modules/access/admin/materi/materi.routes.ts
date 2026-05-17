import Router from 'express';
import {
  createMaterial,
  getMaterialsByModule,
  updateMaterial,
  deleteMaterial,
} from './materi.controller';

const materiRouter = Router();

materiRouter.get('/:modulId', getMaterialsByModule);
materiRouter.post('/', createMaterial);
materiRouter.put('/:id', updateMaterial);
materiRouter.delete('/:id', deleteMaterial);

export default materiRouter;
