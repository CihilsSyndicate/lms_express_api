import { Router } from 'express';
import {
  getStudentProgressByModules,
  getModuleStudentProgress,
  getProgressByStudentId,
  analyzeComputationalThinking,
} from './progress.controller';

const progressRouter = Router();

progressRouter.get('/', getStudentProgressByModules);
progressRouter.get('/module/:modulId', getModuleStudentProgress);
progressRouter.get('/:studentId', getProgressByStudentId);
progressRouter.get('/:studentId/analyze', analyzeComputationalThinking);

export default progressRouter;
