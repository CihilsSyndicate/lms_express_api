import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/middleware/upload';

export const upsertSignature = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'File tanda tangan wajib diunggah.' });
    }

    const signatureUrl = await uploadToCloudinary(file.buffer, 'lms/signatures');

    // Raw update until `prisma generate` syncs the new signatureUrl column
    await prisma.$executeRaw`
      UPDATE "Tutor" SET "signatureUrl" = ${signatureUrl} WHERE id = ${req.user.id}
    `;

    return res.status(200).json({ message: 'Tanda tangan berhasil disimpan.', signatureUrl });
  } catch (error) {
    console.error('[SIGNATURE-UPSERT-ERROR]', error);
    return res.status(500).json({ message: 'Gagal menyimpan tanda tangan.' });
  }
};

export const getSignature = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const rows = await prisma.$queryRaw<Array<{ signatureUrl: string | null }>>`
      SELECT "signatureUrl" FROM "Tutor" WHERE id = ${req.user.id}
    `;

    const signatureUrl = rows[0]?.signatureUrl ?? null;

    return res.status(200).json({ signatureUrl });
  } catch (error) {
    console.error('[SIGNATURE-GET-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
