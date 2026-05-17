import { z } from 'zod';

export const signatureBaseSchema = z.object({
  id: z.string().cuid(),
  tutor_id: z.string().cuid(),
  file_url: z.string().url(),
});

export const createSignatureSchema = signatureBaseSchema.omit({ id: true });
export const updateSignatureSchema = signatureBaseSchema.partial().omit({ id: true, tutor_id: true });

export type Signature = z.infer<typeof signatureBaseSchema>;
export type CreateSignatureRecord = z.infer<typeof createSignatureSchema>;
export type UpdateSignatureRecord = z.infer<typeof updateSignatureSchema>;
export type SignatureSchema = typeof signatureBaseSchema;
