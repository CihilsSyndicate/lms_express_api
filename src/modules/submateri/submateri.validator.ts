import { z } from 'zod';

export const submateriBaseSchema = z.object({
  id: z.string().cuid(),
  materi_id: z.string().cuid(),
  judul: z.string().min(1),
  konten: z.string().min(1),
});

export const createSubmateriSchema = submateriBaseSchema.omit({ id: true });
export const updateSubmateriSchema = submateriBaseSchema.partial().omit({ id: true, materi_id: true });

export type Submateri = z.infer<typeof submateriBaseSchema>;
export type CreateSubmateriRecord = z.infer<typeof createSubmateriSchema>;
export type UpdateSubmateriRecord = z.infer<typeof updateSubmateriSchema>;
export type SubmateriSchema = typeof submateriBaseSchema;
