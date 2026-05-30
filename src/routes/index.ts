import { Router } from 'express';
import authRoutes from '../modules/auth/auth.route';
import { adminRouter } from '../modules/access/admin/route';
import { tutorRouter } from '../modules/access/tutor/route';
import { siswaRouter } from '../modules/access/siswa/route';
import { umumRouter } from '../modules/access/umum/route';
import docsRoutes from '../modules/docs/docs.routes';
import guestRoutes from '../modules/guest/guest.routes';
import uploadRoutes from '../modules/upload/upload.routes';
import notificationRoutes from '../modules/notification/notification.routes';

const router = Router();

router.use('/api/v1', router);

router.use('/auth', authRoutes);
router.use('/admin', adminRouter);
router.use('/tutor', tutorRouter);
router.use('/siswa', siswaRouter);
router.use('/umum', umumRouter);

router.use('/api-docs', docsRoutes);
router.use('/guest', guestRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);

export default router;
