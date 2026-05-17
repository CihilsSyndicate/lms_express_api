import { Router } from 'express';
import {
  registerTutor,
  updateTutor,
  deleteTutor,
  deactivateTutor,
} from './tutor.controller';

const tutorRouter = Router();

tutorRouter.post('/', registerTutor);
tutorRouter.put('/:id', updateTutor);
tutorRouter.delete('/:id', deleteTutor);
tutorRouter.patch('/:id/deactivate', deactivateTutor);

export default tutorRouter;
