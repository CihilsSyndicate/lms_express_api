import Router from 'express';
import {
  getProgressByModule,
  getAllProgressForSiswa,
  markMateriCompleted,
  markItemCompleted,
} from './progress.controller';

const progressRouter = Router();

progressRouter.get('/', getAllProgressForSiswa);
progressRouter.get('/:modulId', getProgressByModule);
progressRouter.post('/materi/:materiId/complete', markMateriCompleted);
progressRouter.post('/item/:itemId/complete', markItemCompleted);

export default progressRouter;
