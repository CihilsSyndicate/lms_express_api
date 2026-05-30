import { Router } from 'express';
import { getAllModules, getModuleByIdHandler, searchModules } from './guest.controller';

const router = Router();

router.get('/modules/search', searchModules);
router.get('/modules', getAllModules);
router.get('/modules/:id', getModuleByIdHandler);

export default router;
