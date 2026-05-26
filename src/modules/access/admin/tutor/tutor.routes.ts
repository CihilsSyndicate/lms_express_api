import { Router } from 'express';
import {
  registerTutor,
  updateTutor,
  deleteTutor,
  deactivateTutor,
  getAllTutors,
} from './tutor.controller';

const tutorRouter = Router();

tutorRouter.post('/', registerTutor);
tutorRouter.get('/', getAllTutors);
tutorRouter.put('/:id', updateTutor);
tutorRouter.delete('/:id', deleteTutor);
tutorRouter.patch('/:id/deactivate', deactivateTutor);

export default tutorRouter;
