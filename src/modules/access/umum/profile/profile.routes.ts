import { Router } from 'express';
import { getUmumProfile } from './profile.controller';

const router = Router();

router.get('/profile', getUmumProfile);

export default router;
