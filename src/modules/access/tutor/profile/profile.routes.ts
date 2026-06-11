import { Router } from 'express';
import { getTutorProfile } from './profile.controller';

const router = Router();

router.get('/', getTutorProfile);

export default router;
