import { Router } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { upsertSignature, getSignature } from './signature.controller';

const signatureRouter = Router();

const signatureUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file .PNG yang diizinkan.'));
    }
  },
});

signatureRouter.get('/', getSignature);
signatureRouter.post('/', signatureUpload.single('file'), upsertSignature);

export default signatureRouter;
