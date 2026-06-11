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
      options as any,
      (error, result) => {
        if (error) return reject(error);

        let url = result!.secure_url;

        // Untuk raw PDF: ubah URL agar serve inline (bukan attachment)
        // Ganti fl_attachment:false (jika ada) atau inject fl_inline
        if (resourceType === 'raw' && format === 'pdf') {
          // Cloudinary raw URL: ...raw/upload/v.../file.pdf
          // Kita inject fl_inline agar browser tampilkan inline
          url = url.replace(
            '/raw/upload/',
            '/raw/upload/fl_inline/',
          );
        }

        resolve(url);
      },
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};
