import Router from 'express';
import {
  getCertificatesForSiswa,
  getCertificateById,
  claimCertificate,
} from './certificates.controller';

const certificateRouter = Router();

certificateRouter.post('/claim', claimCertificate);
certificateRouter.get('/', getCertificatesForSiswa);
certificateRouter.get('/:id', getCertificateById);

export default certificateRouter;
