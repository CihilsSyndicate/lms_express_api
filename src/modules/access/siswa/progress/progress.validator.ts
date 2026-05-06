import { z } from 'zod';

export const progressBaseSchema = z.object({
  id: z.string().cuid(),
  siswa_id: z.string().cuid(),
  modul_id: z.string().cuid(),
  skor_pretest: z.number().int().optional().nullable(),
  skor_posttest: z.number().int().optional().nullable(),
  nilai_akhir: z.number().optional().nullable(),
  status: z.string().min(1).default('IN_PROGRESS'),
  is_lulus: z.boolean().default(false),
  last_accessed: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export const createProgressSchema = progressBaseSchema.omit({ id: true, createdAt: true, last_accessed: true });
export const updateProgressSchema = progressBaseSchema.partial().omit({ id: true, siswa_id: true, modul_id: true });

export type Progress = z.infer<typeof progressBaseSchema>;
export type CreateProgressRecord = z.infer<typeof createProgressSchema>;
export type UpdateProgressRecord = z.infer<typeof updateProgressSchema>;
export type ProgressSchema = typeof progressBaseSchema;
