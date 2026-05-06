import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import siswaRoutes from '../modules/access/siswa/profile/siswa.routes';
import tutorRoutes from '../modules/access/tutor/profile/tutor.routes';
import modulRoutes from '../modules/learning/modules/modul.routes';
import materiRoutes from '../modules/learning/materials/materi.routes';
import submateriRoutes from '../modules/learning/materials/submateri.routes';
import topikRoutes from '../modules/learning/topics/topik.routes';
import pretestRoutes from '../modules/learning/pretests/pretest.routes';
import posttestRoutes from '../modules/learning/posttests/posttest.routes';
import progressRoutes from '../modules/access/siswa/progress/progress.routes';
import certificateRoutes from '../modules/access/siswa/certificates/certificates.routes';
import userRoutes from '../modules/users/users.routes';
import docsRoutes from '../modules/docs/docs.routes';
import ratingRoutes from '../modules/learning/ratings/rating.routes';

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
router.use('/rating', ratingRoutes);
router.use('/user', userRoutes);
router.use('/api-docs', docsRoutes);

export default router;
