import { Router } from 'express';
import { getTutorProfile } from './profile.controller';

const router = Router();

router.get('/profile', getTutorProfile);

export default router;
