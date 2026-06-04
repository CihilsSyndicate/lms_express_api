import { Router } from 'express';
import {
  createTutorQuiz,
  getAllTutorQuiz,
  getTutorQuizById,
  updateTutorQuiz,
  deleteTutorQuiz,
} from './kuis.controller';

const kuisRouter = Router();

kuisRouter.post('/', createTutorQuiz);
kuisRouter.get('/', getAllTutorQuiz);
kuisRouter.get('/:id', getTutorQuizById);
kuisRouter.put('/:id', updateTutorQuiz);
kuisRouter.delete('/:id', deleteTutorQuiz);

export default kuisRouter;
