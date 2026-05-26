import { Router } from 'express';
import {
  getUmumProgressByModule,
  getAllUmumProgress,
} from './progress.controller';

const umumProgressRouter = Router();

umumProgressRouter.get('/', getAllUmumProgress);
umumProgressRouter.get('/:modulId', getUmumProgressByModule);

export default umumProgressRouter;
