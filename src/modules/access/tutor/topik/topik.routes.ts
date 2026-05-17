import Router from 'express';
import {
  createTopic,
  getTopicsByModule,
  updateTopic,
  deleteTopic,
} from './topik.controller';

const topikRouter = Router();

topikRouter.get('/:modulId', getTopicsByModule);
topikRouter.post('/', createTopic);
topikRouter.put('/:id', updateTopic);
topikRouter.delete('/:id', deleteTopic);

export default topikRouter;
