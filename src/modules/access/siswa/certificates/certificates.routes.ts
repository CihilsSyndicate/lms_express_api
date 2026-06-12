import Router from 'express';
import {
  getCertificatesForSiswa,
  getCertificateById,
  getCertificateByModul,
  claimCertificate,
} from './certificates.controller';

const certificateRouter = Router();

certificateRouter.post('/claim', claimCertificate);
certificateRouter.get('/', getCertificatesForSiswa);
certificateRouter.get('/modul/:modulId', getCertificateByModul);
certificateRouter.get('/:id', getCertificateById);

export default certificateRouter;
