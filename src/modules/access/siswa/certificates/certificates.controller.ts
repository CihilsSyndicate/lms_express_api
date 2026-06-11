import { Request, Response } from 'express';
import {
  getStudentCertificates,
  getStudentCertificateById,
} from '@/utils/certificate';
import { parsePaginationQuery } from '@/utils/pagination';
import {
  generateCertificateIfEligibleService,
  ClaimResult,
} from '@/modules/access/siswa/progress/progress.service';

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

    const siswaId = req.user.id as string;
    const { modulId } = req.body as { modulId: string };
    if (!modulId || typeof modulId !== 'string') {
      return res.status(400).json({ message: 'modulId wajib diisi.' });
    }

    const result = await generateCertificateIfEligibleService(siswaId, modulId);

    if (!result) {
      return res.status(400).json({
        message: 'Belum memenuhi syarat untuk mendapatkan sertifikat. Pastikan Anda sudah lulus modul dan modul memiliki fitur sertifikat.',
      });
    }

    if (result.status === 'already_claimed') {
      return res.status(409).json({
        message: 'Sertifikat sudah pernah diklaim sebelumnya.',
        certificate: {
          id: result.certificate.id,
          certificateUrl: result.certificate.certificateUrl,
          kode_sertif: result.certificate.kode_sertif,
          issued_at: result.certificate.issued_at instanceof Date
            ? result.certificate.issued_at.toISOString()
            : String(result.certificate.issued_at),
        },
      });
    }

    return res.status(201).json({
      id: result.certificate.id,
      certificateUrl: result.certificate.certificateUrl,
      kode_sertif: result.certificate.kode_sertif,
      issued_at: result.certificate.issued_at instanceof Date
        ? result.certificate.issued_at.toISOString()
        : String(result.certificate.issued_at),
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
