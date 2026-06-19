import Router from 'express';
import {
  createRangkumanHandler,
  updateRangkumanHandler,
  deleteRangkumanHandler,
} from './rangkuman.controller';

const rangkumanRouter = Router();

rangkumanRouter.post('/', createRangkumanHandler);
rangkumanRouter.put('/:id', updateRangkumanHandler);
rangkumanRouter.delete('/:id', deleteRangkumanHandler);

export default rangkumanRouter;
