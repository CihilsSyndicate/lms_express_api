import { Router } from 'express';
import { Request, Response } from 'express';

export const adminModulRouter = Router();

adminModulRouter.get('/', (req: Request, res: Response) => {
  res.send('Admin Modul Route');
});
