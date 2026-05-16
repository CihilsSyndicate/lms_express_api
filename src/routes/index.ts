import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import progressRoutes from '../modules/access/siswa/progress/progress.routes';
import certificateRoutes from '../modules/access/siswa/certificates/certificates.routes';
import userRoutes from '../modules/users/users.routes';
import docsRoutes from '../modules/docs/docs.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/progress', progressRoutes);
router.use('/certificate', certificateRoutes);
router.use('/user', userRoutes);
router.use('/api-docs', docsRoutes);

export default router;
