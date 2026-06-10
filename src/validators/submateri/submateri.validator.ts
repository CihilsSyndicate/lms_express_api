import { z } from 'zod';

export const submateriBaseSchema = z.object({
  id: z.string(),
  message: z.string(),
});

export const createSubmateriSchema = z.object({
  message: z.string(),
});

export const updateSubmateriSchema = z.object({
  message: z.string(),
});

export type Submateri = z.infer<typeof submateriBaseSchema>;
export type CreateSubmateriRecord = z.infer<typeof createSubmateriSchema>;
export type UpdateSubmateriRecord = z.infer<typeof updateSubmateriSchema>;
export type SubmateriSchema = typeof submateriBaseSchema;
