import { Request, Response } from 'express';
import { UploadFileType } from '@/utils/upload-file';
import { uploadToCloudinary } from '@/middleware/upload';

/* Map setiap tipe file ke folder Cloudinary */
const cloudinaryFolderMap: Record<UploadFileType, string> = {
  [UploadFileType.MODULE_IMAGE]: 'lms/modules',
  [UploadFileType.PROFILE_IMAGE]: 'lms/profiles',
  [UploadFileType.SIGNATURE_IMAGE]: 'lms/signatures',
  [UploadFileType.SOAL_IMAGE]: 'lms/soal',
  [UploadFileType.MATERI_IMAGE]: 'lms/materi',
  [UploadFileType.MATERI_VIDEO]: 'lms/materi-video',
  [UploadFileType.VIDEO]: 'lms/videos',
  [UploadFileType.CV_FILE]: 'lms/cv',
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ message: 'File wajib diupload.' });
    }

    const fileType =
      (req.body.fileType as UploadFileType) || UploadFileType.MODULE_IMAGE;

    const folder = cloudinaryFolderMap[fileType] ?? 'lms/misc';
    const url = await uploadToCloudinary(file.buffer, folder);

    return res.status(200).json({
      message: 'File berhasil diupload.',
      url,
      fileName: file.originalname,
    });
  } catch (error: any) {
    console.error('[UPLOAD-ERROR]', {
      message: error?.message,
      http_code: error?.http_code,
      name: error?.name,
      cloudinary_cloud: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING',
      cloudinary_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
      cloudinary_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING',
    });
    return res.status(500).json({
      message: 'Gagal mengupload file.',
      detail: error?.message ?? String(error),
    });
  }
};
