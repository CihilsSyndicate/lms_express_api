import Router from 'express';
import { getDashboardData } from './dashboards.controller';

const dashboardRouter = Router();

dashboardRouter.get('/', getDashboardData);

export default dashboardRouter;
