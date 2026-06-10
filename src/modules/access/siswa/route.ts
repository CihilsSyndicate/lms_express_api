import { Router } from 'express';
import { requireRole, verifyToken } from '@/lib/auth';
import kuisRouter from './kuis/kuis.routes';
import progressRouter from './progress/progress.routes';
import certificateRouter from './certificates/certificates.routes';
import dashboardRouter from './dashboard/dashboards.routes';
import materiRouter from './materi/materi.routes';
import modulRouter from './modul/modul.routes';
import posttestRouter from './posttest/posttest.routes';
import pretestRouter from './pretest/pretest.routes';
import { ratingRouter } from './rating/rating.route';
import studyRoomRouter from './study-room/study-room.routes';
import submateriRouter from './submateri/submateri.routes';
import topikRouter from './topik/topik.routes';
import siswaProfileRouter from './profile/profile.routes';

export const siswaRouter = Router();

// Middleware: Require Siswa role for all routes in this sub-router
siswaRouter.use(verifyToken, requireRole('siswa'));

siswaRouter.use('/dashboard', dashboardRouter);
siswaRouter.use('/study-room', studyRoomRouter);
siswaRouter.use('/progress', progressRouter);
siswaRouter.use('/certificates', certificateRouter);
siswaRouter.use('/materi', materiRouter);
siswaRouter.use('/modul', modulRouter);
siswaRouter.use('/posttest', posttestRouter);
siswaRouter.use('/pretest', pretestRouter);
siswaRouter.use('/rating', ratingRouter);
siswaRouter.use('/submateri', submateriRouter);
siswaRouter.use('/topik', topikRouter);
siswaRouter.use('/kuis', kuisRouter);
siswaRouter.use('/profile', siswaProfileRouter);
