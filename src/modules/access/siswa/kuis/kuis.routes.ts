import { Router } from 'express';
import { submitQuiz } from './kuis.controller';

const kuisRouter = Router();

kuisRouter.post('/submit', submitQuiz);

export default kuisRouter;
