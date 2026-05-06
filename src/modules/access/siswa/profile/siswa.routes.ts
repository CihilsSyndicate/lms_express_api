import { Router } from 'express';
import * as siswaController from './siswa.controller';

const router = Router();

router.post('/register', siswaController.registerSiswa);

// Google OAuth
router.get('/google', siswaController.googleAuth);
router.get('/google/callback', siswaController.googleCallback);

export default router;
