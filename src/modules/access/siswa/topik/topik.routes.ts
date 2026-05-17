import Router from 'express';
import { getTopicsByModule } from './topik.controller';

const topikRouter = Router();

topikRouter.get('/:modulId', getTopicsByModule);

export default topikRouter;
