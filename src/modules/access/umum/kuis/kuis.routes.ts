import { Router } from 'express';
import { submitUmumQuiz } from './kuis.controller';

const umumKuisRouter = Router();

umumKuisRouter.post('/submit', submitUmumQuiz);

export default umumKuisRouter;
