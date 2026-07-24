import { Router } from 'express';
import { getAllModules, getModuleByIdHandler, searchModules } from './guest.controller';
import { getOembed } from './oembed.controller';

const router = Router();

router.get('/modules/search', searchModules);
router.get('/modules', getAllModules);
router.get('/modules/:id', getModuleByIdHandler);
router.get('/oembed', getOembed);

export default router;
