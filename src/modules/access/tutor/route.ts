import { Router } from 'express';
import { requireRole, verifyToken } from '@/lib/auth';
import { tutorDashboardRouter } from './dashboard/dashboard.route';
import { modulRouter } from './modul/modul.routes';

export const tutorRouter = Router();
tutorRouter.use(requireRole('tutor'), verifyToken);

tutorRouter.use('/tutor', tutorDashboardRouter);
tutorRouter.use('/modules', modulRouter);
