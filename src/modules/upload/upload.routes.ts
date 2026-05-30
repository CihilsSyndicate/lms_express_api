import { Router } from 'express';
import { verifyToken } from '@/lib/auth';
import multer from 'multer';
import { uploadFile } from './upload.controller';

const uploadRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

uploadRouter.post('/', verifyToken, upload.single('file'), uploadFile);

export default uploadRouter;
