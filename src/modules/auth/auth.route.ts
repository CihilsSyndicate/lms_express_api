import { Router } from 'express';
import * as authController from './auth.controller';
import { verifyToken } from '@/lib/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/refresh', verifyToken, authController.refresh);
router.post('/register', authController.register);
router.put('/update', verifyToken, authController.update);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
