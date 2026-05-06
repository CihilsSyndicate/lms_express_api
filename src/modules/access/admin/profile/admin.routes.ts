import Router from 'express';
import { getAdminProfile, updateAdminProfile } from './admin.controller';

export const adminRouter = Router();

adminRouter.get('/profile', getAdminProfile);
adminRouter.put('/profile', updateAdminProfile);
