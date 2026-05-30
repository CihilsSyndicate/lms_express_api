import { Router } from 'express';
import { getAdminProfile } from './profile.controller';

const router = Router();

router.get('/profile', getAdminProfile);

export default router;
