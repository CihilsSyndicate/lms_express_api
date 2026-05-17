import Router from 'express';
import {
  getCertificatesForSiswa,
  getCertificateById,
} from './certificates.controller';

const certificateRouter = Router();

certificateRouter.get('/', getCertificatesForSiswa);
certificateRouter.get('/:id', getCertificateById);

export default certificateRouter;
