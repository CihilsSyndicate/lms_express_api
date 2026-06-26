import { Request, Response } from 'express';
import { UploadFileType } from '@/utils/upload-file';
import { uploadToCloudinary } from '@/middleware/upload';
import cloudinary from '@/lib/cloudinary';

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

/* Ambil ekstensi tanpa titik dari nama file, misal 'abc.pdf' → 'pdf' */
function getExtension(filename: string): string | undefined {
  const parts = filename.split('.');
  if (parts.length <= 1) return undefined;
  const ext = parts[parts.length - 1];
  return ext !== undefined ? ext.toLowerCase() : undefined;
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

    // Kirim ekstensi untuk raw/video agar Cloudinary menyimpannya
    const format =
      resourceType !== 'image' ? getExtension(file.originalname) : undefined;

    const url = await uploadToCloudinary(
      file.buffer,
      folder,
      resourceType,
      format,
    );

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

/**
 * GET /upload/signed-url?url=<cloudinary_url>
 *
 * Menggunakan cloudinary.url() + sign_url:true untuk generate signed CDN URL.
 * Ini bekerja untuk resource type:upload (public delivery) yang dibatasi
 * oleh Cloudinary Strict Transformations atau Restricted Media Access.
 * Signed URL memiliki signature s--xxx-- yang di-accept Cloudinary.
 */
export const getSignedUrl = async (req: Request, res: Response) => {
  try {
    const rawUrl = req.query.url as string | undefined;
    if (!rawUrl) {
      return res.status(400).json({ message: 'Parameter url wajib diisi.' });
    }

    if (!rawUrl.includes('res.cloudinary.com')) {
      return res
        .status(400)
        .json({ message: 'Hanya URL Cloudinary yang diizinkan.' });
    }

    // Strip semua transformation flags dari URL agar dapat public_id bersih
    // Contoh URL: .../raw/upload/fl_attachment:false/v1234/lms/cv/file.pdf
    //         atau .../raw/upload/fl_inline/v1234/lms/cv/file.pdf
    //         atau .../raw/upload/v1234/lms/cv/file.pdf (sudah bersih)
    const match = rawUrl.match(
      /\/(?:image|video|raw)\/(?:upload|authenticated)\/(?:[^/]+\/)*v(\d+)\/(.+)$/,
    );
    if (!match) {
      return res.status(400).json({ message: 'URL Cloudinary tidak valid.' });
    }

    const version = parseInt(match[1] as string, 10);
    const fullPath = match[2]; // misal: lms/cv/file.pdf
    const lastDotIdx = fullPath?.lastIndexOf('.');
    const publicId =
      lastDotIdx !== -1 ? fullPath?.substring(0, lastDotIdx) : fullPath;
    const format =
      lastDotIdx !== -1
        ? fullPath?.substring((lastDotIdx as number) + 1)
        : undefined;

    // Determine resource_type dari URL
    const resourceType = rawUrl.includes('/raw/')
      ? 'raw'
      : rawUrl.includes('/video/')
        ? 'video'
        : 'image';

    // cloudinary.url() + sign_url:true → signed CDN URL (s--sig-- embedded)
    // Ini bypass Strict Transformations & Restricted Media Access untuk type:upload
    const signedUrl = cloudinary.url(publicId as string, {
      resource_type: resourceType as any,
      type: 'upload',
      sign_url: true,
      secure: true,
      format: format ?? undefined,
      version,
    });

    return res.status(200).json({ signedUrl });
  } catch (error: any) {
    console.error('[SIGNED-URL-ERROR]', error?.message);
    return res.status(500).json({
      message: 'Gagal membuat signed URL.',
      detail: error?.message ?? String(error),
    });
  }
};

/**
 * GET /upload/signature?fileType=<UploadFileType>
 *
 * Men-generate signature untuk Cloudinary direct upload dari frontend.
 */
export const getUploadSignature = async (req: Request, res: Response) => {
  try {
    const fileType = (req.query.fileType as UploadFileType) || UploadFileType.MODULE_IMAGE;
    const config = fileTypeConfig[fileType] || { folder: 'lms/misc', resourceType: 'auto' };
    const folder = config.folder;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return res.status(200).json({
      timestamp,
      signature,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error: any) {
    console.error('[SIGNATURE-ERROR]', error?.message);
    return res.status(500).json({
      message: 'Gagal membuat upload signature.',
      detail: error?.message ?? String(error),
    });
  }
};
