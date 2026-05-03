import path from 'path';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';

export enum UploadFileType {
  PROFILE_IMAGE = 'PROFILE_IMAGE',
  SIGNATURE_IMAGE = 'SIGNATURE_IMAGE',
  VIDEO = 'VIDEO',
}

export interface UploadFileInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export interface UploadFileResult {
  fileName: string;
  filePath: string;
  publicPath: string;
  mimeType: string;
  size: number;
  type: UploadFileType;
}

const uploadDirectories: Record<UploadFileType, string> = {
  [UploadFileType.PROFILE_IMAGE]: 'profile-images',
  [UploadFileType.SIGNATURE_IMAGE]: 'signature-images',
  [UploadFileType.VIDEO]: 'videos',
};

function getFileExtension(originalname: string, mimetype: string): string {
  const ext = path.extname(originalname).toLowerCase();
  if (ext) return ext;

  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
  };

  return mimeToExt[mimetype] ?? '';
}

export async function uploadFileToStorage(
  file: UploadFileInput,
  type: UploadFileType,
  baseDir = path.resolve(process.cwd(), 'storage'),
): Promise<UploadFileResult> {
  const folder = uploadDirectories[type];
  const extension = getFileExtension(file.originalname, file.mimetype);
  const fileName = `${randomUUID()}${extension}`;
  const filePath = path.join(baseDir, folder, fileName);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, file.buffer);

  return {
    fileName,
    filePath,
    publicPath: path.join(folder, fileName).replace(/\\/g, '/'),
    mimeType: file.mimetype,
    size: file.buffer.length,
    type,
  };
}
