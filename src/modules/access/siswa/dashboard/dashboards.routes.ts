import Router from 'express';
import { getDashboardData } from './dashboards.controller';
import { verifyToken } from '../../../../lib/auth';

const dashboardRouter = Router();

dashboardRouter.get('/:siswa_id', verifyToken, getDashboardData);

export default dashboardRouter;
