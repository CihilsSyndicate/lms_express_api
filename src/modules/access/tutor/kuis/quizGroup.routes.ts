import { Router } from 'express';
import {
  createQuizGroup,
  updateQuizGroup,
  removeQuizGroup,
  getQuizGroup,
  listQuizGroupsByTopik,
} from './quizGroup.controller';

const quizGroupRouter = Router();

quizGroupRouter.post('/', createQuizGroup);
quizGroupRouter.get('/topik/:topikId', listQuizGroupsByTopik);
quizGroupRouter.get('/:id', getQuizGroup);
quizGroupRouter.put('/:id', updateQuizGroup);
quizGroupRouter.delete('/:id', removeQuizGroup);

export default quizGroupRouter;
