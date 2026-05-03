import { Router } from 'express';
import * as authController from './auth.controller';
import { verifyToken } from '../../lib/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', verifyToken, authController.me);

export default router;
