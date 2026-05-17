import { Router } from 'express';
import {
  getStudentProgressByModules,
  getProgressByStudentId,
  analyzeComputationalThinking,
} from './progress.controller';

const progressRouter = Router();

progressRouter.get('/', getStudentProgressByModules);
progressRouter.get('/:studentId', getProgressByStudentId);
progressRouter.get('/:studentId/analyze', analyzeComputationalThinking);

export default progressRouter;
