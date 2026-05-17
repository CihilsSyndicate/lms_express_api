import { z } from 'zod';

export const certificateBaseSchema = z.object({
  id: z.string().cuid(),
  siswaId: z.string().cuid(),
  modulId: z.string().cuid(),
  kode_sertif: z.string().min(1),
  issued_at: z.coerce.date(),
  certificateUrl: z.string().url(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createCertificateSchema = certificateBaseSchema.omit({
  id: true,
  issued_at: true,
});
export const updateCertificateSchema = certificateBaseSchema
  .partial()
  .omit({ id: true, siswaId: true, modulId: true, kode_sertif: true });

export type Certificate = z.infer<typeof certificateBaseSchema>;
export type CreateCertificateRecord = z.infer<typeof createCertificateSchema>;
export type UpdateCertificateRecord = z.infer<typeof updateCertificateSchema>;
export type CertificateSchema = typeof certificateBaseSchema;
