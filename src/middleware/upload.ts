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
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
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
