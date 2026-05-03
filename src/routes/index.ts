import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import siswaRoutes from '../modules/siswa/siswa.routes';
import tutorRoutes from '../modules/tutor/tutor.routes';
import modulRoutes from '../modules/modul/modul.routes';
import materiRoutes from '../modules/materi/materi.routes';
import submateriRoutes from '../modules/submateri/submateri.routes';
import topikRoutes from '../modules/topik/topik.routes';
import pretestRoutes from '../modules/pretest/pretest.routes';
import posttestRoutes from '../modules/posttest/posttest.routes';
import progressRoutes from '../modules/progress/progress.routes';
import certificateRoutes from '../modules/certificate/certificate.routes';
import userRoutes from '../modules/user/user.routes';
import docsRoutes from '../modules/docs/docs.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/siswa', siswaRoutes);
router.use('/tutor', tutorRoutes);
router.use('/modul', modulRoutes);
router.use('/materi', materiRoutes);
router.use('/submateri', submateriRoutes);
router.use('/topik', topikRoutes);
router.use('/pretest', pretestRoutes);
router.use('/posttest', posttestRoutes);
router.use('/progress', progressRoutes);
router.use('/certificate', certificateRoutes);
router.use('/user', userRoutes);
router.use('/api-docs', docsRoutes);

export default router;
