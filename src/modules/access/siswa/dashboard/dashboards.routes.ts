import Router from 'express';
import { getDashboardData } from './dashboards.controller';
import { requireRole, verifyToken } from '@/lib/auth';

const dashboardRouter = Router();

dashboardRouter.get('/', verifyToken, requireRole('siswa'), getDashboardData);

export default dashboardRouter;
