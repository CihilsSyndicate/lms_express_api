import { Router } from 'express';
import { listUlasan } from './ulasan.controller';

export const ulasanRouter = Router();

ulasanRouter.get('/', listUlasan);
