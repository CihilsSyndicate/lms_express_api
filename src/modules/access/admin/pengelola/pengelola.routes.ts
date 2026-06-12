import { Router } from 'express';
import {
  getAllAdmins,
  registerAdmin,
  updateAdmin,
  deleteAdmin,
  deactivateAdmin,
  activateAdmin,
} from './pengelola.controller';

const adminPengelolaRouter = Router();

adminPengelolaRouter.get('/', getAllAdmins);
adminPengelolaRouter.post('/', registerAdmin);
adminPengelolaRouter.put('/:id', updateAdmin);
adminPengelolaRouter.delete('/:id', deleteAdmin);
adminPengelolaRouter.patch('/:id/deactivate', deactivateAdmin);
adminPengelolaRouter.patch('/:id/activate', activateAdmin);

export default adminPengelolaRouter;
