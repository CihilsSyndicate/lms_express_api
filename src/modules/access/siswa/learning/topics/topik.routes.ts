import Router from 'express';
import {
  createTopic,
  getTopicsByModule,
  updateTopic,
  deleteTopic,
} from './topik.controller';
import { verifyToken, requireRole } from '@/lib/auth';

const topikRouter = Router();

topikRouter.get('/:modulId', verifyToken, getTopicsByModule);

topikRouter.post('/', verifyToken, requireRole('tutor'), createTopic);
topikRouter.put('/:id', verifyToken, requireRole('tutor'), updateTopic);
topikRouter.delete('/:id', verifyToken, requireRole('tutor'), deleteTopic);

export default topikRouter;
