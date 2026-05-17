import { Router } from 'express';
import { loadDashboardData } from './dashboard.controller';

export const tutorDashboardRouter = Router();

tutorDashboardRouter.get('/', loadDashboardData);
