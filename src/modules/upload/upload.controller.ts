import { Request, Response } from 'express';
import { UploadFileType } from '@/utils/upload-file';
import { uploadToCloudinary } from '@/middleware/upload';

type ResourceType = 'image' | 'video' | 'raw' | 'auto';

interface FileTypeConfig {
  folder: string;
  resourceType: ResourceType;
}

/* Map setiap tipe file ke folder dan resource_type Cloudinary */
const fileTypeConfig: Record<UploadFileType, FileTypeConfig> = {
  [UploadFileType.MODULE_IMAGE]: {
    folder: 'lms/modules',
    resourceType: 'image',
  },
  [UploadFileType.PROFILE_IMAGE]: {
    folder: 'lms/profiles',
    resourceType: 'image',
  },
  [UploadFileType.SIGNATURE_IMAGE]: {
    folder: 'lms/signatures',
    resourceType: 'image',
  },
  [UploadFileType.SOAL_IMAGE]: { folder: 'lms/soal', resourceType: 'image' },
  [UploadFileType.MATERI_IMAGE]: {
    folder: 'lms/materi',
    resourceType: 'image',
  },
  [UploadFileType.MATERI_VIDEO]: {
    folder: 'lms/materi',
    resourceType: 'video',
  },
  [UploadFileType.VIDEO]: { folder: 'lms/videos', resourceType: 'video' },
  [UploadFileType.CV_FILE]: { folder: 'lms/cv', resourceType: 'raw' },
};

/* Deteksi resource_type dari mimetype jika fileType tidak dikenal */
function resourceTypeFromMime(mimetype: string): ResourceType {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'raw'; // pdf, doc, dll
}

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ message: 'File wajib diupload.' });
    }

    const fileType =
      (req.body.fileType as UploadFileType) || UploadFileType.MODULE_IMAGE;
    const config = fileTypeConfig[fileType];

    const folder = config?.folder ?? 'lms/misc';
    const resourceType =
      config?.resourceType ?? resourceTypeFromMime(file.mimetype);

    const url = await uploadToCloudinary(file.buffer, folder, resourceType);

    return res.status(200).json({
      message: 'File berhasil diupload.',
      url,
      fileName: file.originalname,
    });
  } catch (error: any) {
    console.error('[UPLOAD-ERROR]', {
      message: error?.message,
      http_code: error?.http_code,
      fileType: req.body?.fileType,
      mimetype: (req as any).file?.mimetype,
    });
    return res.status(500).json({
      message: 'Gagal mengupload file.',
      detail: error?.message ?? String(error),
    });
  }
};
