import Router from 'express';
import {
  createSubmaterial,
  getSubmaterialsByMaterial,
  getSubmaterialDetail,
  updateSubmaterial,
  deleteSubmaterial,
} from './submateri.controller';

const submateriRouter = Router();

submateriRouter.get('/materi/:materiId', getSubmaterialsByMaterial);
submateriRouter.get('/:id', getSubmaterialDetail);
submateriRouter.post('/', createSubmaterial);
submateriRouter.put('/:id', updateSubmaterial);
submateriRouter.delete('/:id', deleteSubmaterial);

export default submateriRouter;
