import { Router } from 'express';
import {
  getUmumModulesController,
  getUmumModuleByIdController,
  enrollUmumModuleController,
  getUmumEnrolledModulesController,
} from './modul.controller';

const umumModulRouter = Router();

umumModulRouter.get('/', getUmumModulesController);
umumModulRouter.get('/enrolled', getUmumEnrolledModulesController);
umumModulRouter.get('/:id', getUmumModuleByIdController);
umumModulRouter.post('/:id/enroll', enrollUmumModuleController);

export default umumModulRouter;
