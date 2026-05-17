import Router from 'express';
import {
  getSubmaterialsByMaterial,
  getSubmaterialDetail,
} from './submateri.controller';

const submateriRouter = Router();

submateriRouter.get('/materi/:materiId', getSubmaterialsByMaterial);
submateriRouter.get('/:id', getSubmaterialDetail);

export default submateriRouter;
