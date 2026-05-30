import { Request, Response } from 'express';
import { uploadFileToStorage, UploadFileType } from '@/utils/upload-file';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ message: 'File wajib diupload.' });
    }

    const fileType = (req.body.fileType as UploadFileType) || UploadFileType.PROFILE_IMAGE;
    const result = await uploadFileToStorage(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      },
      fileType,
    );

    return res.status(200).json({
      message: 'File berhasil diupload.',
      url: result.publicPath,
      fileName: file.originalname,
    });
  } catch (error) {
    console.error('[UPLOAD-ERROR]', error);
    return res.status(500).json({ message: 'Gagal mengupload file.' });
  }
};
