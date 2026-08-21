import { Request, Response } from 'express';
import { importModulFromExcel, ImportValidationException } from '@/utils/import-modul';
import { generateImportTemplate } from '@/utils/generate-import-template';

export const importModul = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File Excel (.xlsx) wajib diunggah.' });
    }
    const tutorId = req.user?.id;
    if (!tutorId) {
      return res.status(401).json({ message: 'Akses ditolak.' });
    }
    const result = await importModulFromExcel(req.file.buffer, tutorId);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof ImportValidationException) {
      return res.status(422).json({ message: 'Template memiliki kesalahan data.', errors: error.errors });
    }
    console.error('[IMPORT-ERROR]', error);
    return res.status(500).json({ message: 'Gagal mengimpor modul. Coba lagi atau hubungi admin.' });
  }
};

export const downloadTemplate = async (_req: Request, res: Response) => {
  try {
    const buffer = await generateImportTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="template-import-modul.xlsx"');
    res.setHeader('Content-Length', buffer.length);
    return res.end(buffer);
  } catch (error) {
    console.error('[IMPORT-TEMPLATE-ERROR]', error);
    return res.status(500).json({ message: 'Gagal membuat template.' });
  }
};
