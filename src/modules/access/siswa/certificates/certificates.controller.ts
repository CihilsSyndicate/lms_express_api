import { Request, Response } from 'express';
import {
  getStudentCertificates,
  getStudentCertificateById,
} from '@/utils/certificate';
import { parsePaginationQuery } from '@/utils/pagination';
import { generateCertificateIfEligibleService } from '@/modules/access/siswa/progress/progress.service';

interface CertificateRow {
  id: string;
  kode_sertif: string;
  certificateUrl: string;
  issued_at: Date;
}

export const getCertificatesForSiswa = async (req: Request, res: Response) => {
  try {
    const siswaId = req.user?.id;

    if (req.user?.role !== 'siswa') {
      return res
        .status(403)
        .json({ message: 'Hanya siswa yang bisa melihat sertifikat.' });
    }

    const { limit, cursor } = parsePaginationQuery(req.query);
    const certificates = await getStudentCertificates(
      siswaId as string,
      limit,
      cursor,
    );

    res.status(200).json(certificates);
  } catch (error: any) {
    console.error('[CERTIFICATE-ERROR] Gagal mengambil sertifikat:', error);
    if (
      error.message === 'Invalid limit parameter' ||
      error.message === 'Invalid cursor'
    ) {
      return res.status(400).json({ message: error.message });
    }
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil sertifikat.' });
  }
};

export const claimCertificate = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'siswa') {
      return res.status(403).json({ message: 'Hanya siswa yang bisa mengklaim sertifikat.' });
    }
    const siswaId = req.user.id;
    const { modulId } = req.body as { modulId: string };
    if (!modulId || typeof modulId !== 'string') {
      return res.status(400).json({ message: 'modulId wajib diisi.' });
    }
    const row = await generateCertificateIfEligibleService(siswaId, modulId) as CertificateRow | null;
    if (!row) {
      return res.status(403).json({ message: 'Belum memenuhi syarat untuk mendapatkan sertifikat.' });
    }
    return res.status(200).json({
      id: row.id,
      certificateUrl: row.certificateUrl,
      kode_sertif: row.kode_sertif,
      issued_at: row.issued_at instanceof Date ? row.issued_at.toISOString() : String(row.issued_at),
    });
  } catch (error) {
    console.error('[CERTIFICATE-CLAIM-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getCertificateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const siswaId = req.user?.id;

    const certificate = await getStudentCertificateById(id as string);

    if (!certificate) {
      return res.status(404).json({ message: 'Sertifikat tidak ditemukan.' });
    }

    if (certificate.siswaId !== siswaId) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    res.status(200).json(certificate);
  } catch (error) {
    console.error('[CERTIFICATE-ERROR] Gagal mengambil sertifikat:', error);
    res
      .status(500)
      .json({ message: 'Internal server error saat mengambil sertifikat.' });
  }
};
