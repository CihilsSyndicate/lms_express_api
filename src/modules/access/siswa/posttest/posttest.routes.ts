import Router from 'express';
import {
  getPosttestByModul,
  submitPosttest,
} from './posttest.controller';

const posttestRouter = Router();

posttestRouter.get('/:modulId', getPosttestByModul);
posttestRouter.post('/:modulId/submit', submitPosttest);

export default posttestRouter;
