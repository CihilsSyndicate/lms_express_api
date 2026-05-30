import { Router } from 'express';
import { getSiswaProfile } from './profile.controller';

const router = Router();

router.get('/profile', getSiswaProfile);

export default router;
