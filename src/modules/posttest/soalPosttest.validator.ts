import { z } from 'zod';

export const soalPosttestBaseSchema = z.object({
  id: z.string().cuid(),
  posttest_id: z.string().cuid(),
  pertanyaan: z.string().min(1),
  pilihan: z.any(),
  jawaban_benar: z.string().min(1),
  skor: z.number().int().default(10),
});

export const createSoalPosttestSchema = soalPosttestBaseSchema.omit({ id: true });
export const updateSoalPosttestSchema = soalPosttestBaseSchema.partial().omit({ id: true, posttest_id: true });

export type SoalPosttest = z.infer<typeof soalPosttestBaseSchema>;
export type CreateSoalPosttestRecord = z.infer<typeof createSoalPosttestSchema>;
export type UpdateSoalPosttestRecord = z.infer<typeof updateSoalPosttestSchema>;
export type SoalPosttestSchema = typeof soalPosttestBaseSchema;
