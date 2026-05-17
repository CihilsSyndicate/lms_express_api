import { Router } from 'express';
import {
  createQuiz,
  getAllQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
} from './kuis.controller';

const kuisRouter = Router();

kuisRouter.post('/', createQuiz);
kuisRouter.get('/', getAllQuiz);
kuisRouter.get('/:id', getQuizById);
kuisRouter.put('/:id', updateQuiz);
kuisRouter.delete('/:id', deleteQuiz);

export default kuisRouter;
