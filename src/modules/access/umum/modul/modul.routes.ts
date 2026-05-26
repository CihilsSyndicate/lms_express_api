import { Router } from 'express';
import {
  getUmumModulesController,
  getUmumModuleByIdController,
  enrollUmumModuleController,
} from './modul.controller';

const umumModulRouter = Router();

umumModulRouter.get('/', getUmumModulesController);
umumModulRouter.get('/:id', getUmumModuleByIdController);
umumModulRouter.post('/:id/enroll', enrollUmumModuleController);

export default umumModulRouter;
