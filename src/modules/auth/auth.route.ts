import { Router } from 'express';
import * as authController from './auth.controller';
import { verifyToken } from '@/lib/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/refresh', verifyToken, authController.refresh);
router.get('/me', verifyToken, authController.me);
router.post('/register', authController.register);
router.put('/update', verifyToken, authController.update);

export default router;
