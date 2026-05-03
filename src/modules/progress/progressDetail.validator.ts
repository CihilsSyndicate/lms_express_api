import { z } from 'zod';

export const progressDetailBaseSchema = z.object({
  id: z.string().cuid(),
  siswa_id: z.string().cuid(),
  submateri_id: z.string().cuid(),
  is_completed: z.boolean().default(false),
  completed_at: z.coerce.date().optional().nullable(),
});

export const createProgressDetailSchema = progressDetailBaseSchema.omit({ id: true });
export const updateProgressDetailSchema = progressDetailBaseSchema.partial().omit({ id: true, siswa_id: true, submateri_id: true });

export type ProgressDetail = z.infer<typeof progressDetailBaseSchema>;
export type CreateProgressDetailRecord = z.infer<typeof createProgressDetailSchema>;
export type UpdateProgressDetailRecord = z.infer<typeof updateProgressDetailSchema>;
export type ProgressDetailSchema = typeof progressDetailBaseSchema;
