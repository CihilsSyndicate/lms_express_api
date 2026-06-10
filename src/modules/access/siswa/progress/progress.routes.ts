import Router from 'express';
import {
  getProgressByModule,
  getAllProgressForSiswa,
  markSubmateriCompleted,
  markItemCompleted,
} from './progress.controller';

const progressRouter = Router();

progressRouter.get('/', getAllProgressForSiswa);
progressRouter.get('/:modulId', getProgressByModule);
progressRouter.post('/submateri/:submateriId/complete', markSubmateriCompleted);
progressRouter.post('/item/:itemId/complete', markItemCompleted);

export default progressRouter;
