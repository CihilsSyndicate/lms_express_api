import { Router } from 'express';
import { requireRole, verifyToken } from '@/lib/auth';
import umumModulRouter from './modul/modul.routes';
import umumKuisRouter from './kuis/kuis.routes';
import umumProgressRouter from './progress/progress.routes';

export const umumRouter = Router();

// Middleware: Require Umum role for all routes in this sub-router
umumRouter.use(verifyToken, requireRole('umum'));

umumRouter.use('/modul', umumModulRouter);
umumRouter.use('/kuis', umumKuisRouter);
umumRouter.use('/progress', umumProgressRouter);
