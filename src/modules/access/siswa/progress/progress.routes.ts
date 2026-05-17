import Router from 'express';
import {
  getProgressByModule,
  getAllProgressForSiswa,
  markSubmateriCompleted,
} from './progress.controller';

const progressRouter = Router();

progressRouter.get('/', getAllProgressForSiswa);
progressRouter.get('/:modulId', getProgressByModule);
progressRouter.post('/submateri/:submateriId/complete', markSubmateriCompleted);

export default progressRouter;
