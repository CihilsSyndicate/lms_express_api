import { Router } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { importModul, downloadTemplate } from './import.controller';

const importRouter = Router();

const xlsxUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file .xlsx yang diperbolehkan.'));
    }
  },
});

importRouter.get('/template', downloadTemplate);
importRouter.post('/modul', xlsxUpload.single('file'), importModul);

export default importRouter;
