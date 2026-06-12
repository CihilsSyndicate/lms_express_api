import { Router } from 'express';
import { verifyToken } from '@/lib/auth';
import multer from 'multer';
import { uploadFile, getSignedUrl } from './upload.controller';

const uploadRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipe file tidak didukung: ${file.mimetype}`));
    }
  },
});

uploadRouter.post('/', verifyToken, upload.single('file'), uploadFile);
uploadRouter.get('/signed-url', verifyToken, getSignedUrl);

export default uploadRouter;
