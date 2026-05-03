import { z } from 'zod';

export const materiBaseSchema = z.object({
  id: z.string().cuid(),
  modul_id: z.string().cuid(),
  tutor_id: z.string().cuid(),
  is_video: z.boolean().default(false),
  video_url: z.string().url().optional().nullable(),
  article: z.string().optional().nullable(),
});

export const createMateriSchema = materiBaseSchema.omit({ id: true });
export const updateMateriSchema = materiBaseSchema.partial().omit({ id: true, modul_id: true, tutor_id: true });

export type Materi = z.infer<typeof materiBaseSchema>;
export type CreateMateriRecord = z.infer<typeof createMateriSchema>;
export type UpdateMateriRecord = z.infer<typeof updateMateriSchema>;
export type MateriSchema = typeof materiBaseSchema;
