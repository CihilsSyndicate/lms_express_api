import { Router } from 'express';
import * as tutorController from './tutor.controller';

const router = Router();

router.post('/register', tutorController.registerTutor);

// Google OAuth
router.get('/google', tutorController.googleAuth);
router.get('/google/callback', tutorController.googleCallback);

export default router;
