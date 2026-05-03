import Router from 'express';
import {
  getCertificatesForSiswa,
  getCertificateById,
} from './certificate.controller';
import { verifyToken, requireRole } from '../../lib/auth';

const certificateRouter = Router();

certificateRouter.get(
  '/',
  verifyToken,
  requireRole('siswa'),
  getCertificatesForSiswa,
);
certificateRouter.get(
  '/:id',
  verifyToken,
  requireRole('siswa'),
  getCertificateById,
);

export default certificateRouter;
