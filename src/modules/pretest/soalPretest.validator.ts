import { z } from 'zod';

export const soalPretestBaseSchema = z.object({
  id: z.string().cuid(),
  pretest_id: z.string().cuid(),
  pertanyaan: z.string().min(1),
  pilihan: z.any(),
  jawaban_benar: z.string().min(1),
  skor: z.number().int().default(10),
});

export const createSoalPretestSchema = soalPretestBaseSchema.omit({ id: true });
export const updateSoalPretestSchema = soalPretestBaseSchema.partial().omit({ id: true, pretest_id: true });

export type SoalPretest = z.infer<typeof soalPretestBaseSchema>;
export type CreateSoalPretestRecord = z.infer<typeof createSoalPretestSchema>;
export type UpdateSoalPretestRecord = z.infer<typeof updateSoalPretestSchema>;
export type SoalPretestSchema = typeof soalPretestBaseSchema;
