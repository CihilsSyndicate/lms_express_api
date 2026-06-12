import multer from 'multer';
import { Readable } from 'stream';
import cloudinary from '@/lib/cloudinary';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

type ResourceType = 'image' | 'video' | 'raw' | 'auto';

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string = 'lms/modules',
  resourceType: ResourceType = 'image',
  format?: string, // ekstensi file tanpa titik, misal 'pdf', 'mp4'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const options: Record<string, unknown> = {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
    };

    // Raw files (PDF, doc, dll) harus public agar bisa diakses tanpa auth
    if (resourceType === 'raw') {
      options.access_mode = 'public';
    }

    // Untuk raw/video, set format eksplisit agar ekstensi tersimpan
    if (format) options.format = format;

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      },
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};
