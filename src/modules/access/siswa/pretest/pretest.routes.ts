import Router from 'express';
import {
  getPretestByModul,
  submitPretest,
} from './pretest.controller';

const pretestRouter = Router();

pretestRouter.get('/:modulId', getPretestByModul);
pretestRouter.post('/:modulId/submit', submitPretest);

export default pretestRouter;
