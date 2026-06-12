import { Router } from 'express';
import { verifyToken, requireRole } from '@/lib/auth';
import dashboardRouter from './dashboard/dashboard.routes';
import kuisRouter from './kuis/kuis.routes';
import materiRouter from './materi/materi.routes';
import { adminModulRouter } from './modul/modul.route';
import progressRouter from './progress/progress.routes';
import { pengelolaanSiswaRouter } from './siswa/siswa.routes';
import topikRouter from './topik/topik.routes';
import tutorRouter from './tutor/tutor.routes';
import adminProfileRouter from './profile/profile.routes';
import pretestRouter from './pretest/pretest.routes';
import posttestRouter from './posttest/posttest.routes';
import adminPengelolaRouter from './pengelola/pengelola.routes';

export const adminRouter = Router();

// Middleware: Require Admin role for all routes in this sub-router
adminRouter.use(verifyToken, requireRole('admin'));

adminRouter.use('/dashboard', dashboardRouter);
adminRouter.use('/kuis', kuisRouter);
adminRouter.use('/materi', materiRouter);
adminRouter.use('/modul', adminModulRouter);
adminRouter.use('/manage/module', adminModulRouter);
adminRouter.use('/progress', progressRouter);
adminRouter.use('/siswa', pengelolaanSiswaRouter);
adminRouter.use('/manage/siswa', pengelolaanSiswaRouter);
adminRouter.use('/topik', topikRouter);
adminRouter.use('/tutor', tutorRouter);
adminRouter.use('/manage/tutor', tutorRouter);
adminRouter.use('/profile', adminProfileRouter);
adminRouter.use('/pretest', pretestRouter);
adminRouter.use('/posttest', posttestRouter);
adminRouter.use('/pengelola', adminPengelolaRouter);
