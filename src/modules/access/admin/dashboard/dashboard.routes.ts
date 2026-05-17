import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller';

const dashboardRouter = Router();

dashboardRouter.get('/', getDashboardStats);

export default dashboardRouter;
