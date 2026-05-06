import Router from 'express';
import { ratingModul } from './rating.controller';
import { verifyToken, requireRole } from '../../../lib/auth';

const ratingRouter = Router();

ratingRouter.post('/:id', verifyToken, requireRole('siswa'), ratingModul);

export default ratingRouter;
