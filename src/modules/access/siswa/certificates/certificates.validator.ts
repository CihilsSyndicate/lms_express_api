import { z } from 'zod';

export const certificateBaseSchema = z.object({
  id: z.string().cuid(),
  siswa_id: z.string().cuid(),
  modul_id: z.string().cuid(),
  kode_sertif: z.string().min(1),
  issued_at: z.coerce.date(),
  url_sertif: z.string().url(),
});

export const createCertificateSchema = certificateBaseSchema.omit({
  id: true,
  issued_at: true,
});
export const updateCertificateSchema = certificateBaseSchema
  .partial()
  .omit({ id: true, siswa_id: true, modul_id: true, kode_sertif: true });

export type Certificate = z.infer<typeof certificateBaseSchema>;
export type CreateCertificateRecord = z.infer<typeof createCertificateSchema>;
export type UpdateCertificateRecord = z.infer<typeof updateCertificateSchema>;
export type CertificateSchema = typeof certificateBaseSchema;
