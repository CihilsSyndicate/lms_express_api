import Router from 'express';
import { getMaterialsByModule } from './materi.controller';

const materiRouter = Router();

materiRouter.get('/:modulId', getMaterialsByModule);

export default materiRouter;
