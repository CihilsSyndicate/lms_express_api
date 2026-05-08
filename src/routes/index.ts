import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import progressRoutes from '../modules/access/siswa/progress/progress.routes';
import certificateRoutes from '../modules/access/siswa/certificates/certificates.routes';
import userRoutes from '../modules/users/users.routes';
import docsRoutes from '../modules/docs/docs.routes';

const router = Router();

router.use('/auth', authRoutes);
// router.use('/siswa', siswaRoutes);
// router.use('/tutor', tutorRoutes);
// router.use('/modul', modulRoutes);
// router.use('/materi', materiRoutes);
// router.use('/submateri', submateriRoutes);
// router.use('/topik', topikRoutes);
// router.use('/pretest', pretestRoutes);
// router.use('/posttest', posttestRoutes);
router.use('/progress', progressRoutes);
router.use('/certificate', certificateRoutes);
// router.use('/rating', ratingRoutes);
router.use('/user', userRoutes);
router.use('/api-docs', docsRoutes);

export default router;
