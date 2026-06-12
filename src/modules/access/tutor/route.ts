import { Router } from 'express';
import { requireRole, verifyToken } from '@/lib/auth';
import { tutorDashboardRouter } from './dashboard/dashboard.route';
import { modulRouter } from './modul/modul.routes';
import materiRouter from './materi/materi.routes';
import topikRouter from './topik/topik.routes';
import pretestRouter from './pretest/pretest.routes';
import posttestRouter from './posttest/posttest.routes';
import progressRouter from './progress/progress.routes';
import tutorProfileRouter from './profile/profile.routes';
import kuisRouter from './kuis/kuis.routes';
import signatureRouter from './signature/signature.routes';
import { ulasanRouter } from './ulasan/ulasan.routes';

export const tutorRouter = Router();

// Middleware: Require Tutor role for all routes in this sub-router
tutorRouter.use(verifyToken, requireRole('tutor'));

tutorRouter.use('/dashboard', tutorDashboardRouter);
tutorRouter.use('/modul', modulRouter);
tutorRouter.use('/materi', materiRouter);
tutorRouter.use('/topik', topikRouter);
tutorRouter.use('/pretest', pretestRouter);
tutorRouter.use('/posttest', posttestRouter);
tutorRouter.use('/progress', progressRouter);
tutorRouter.use('/kuis', kuisRouter);
tutorRouter.use('/profile', tutorProfileRouter);
tutorRouter.use('/signature', signatureRouter);
tutorRouter.use('/ulasan', ulasanRouter);
