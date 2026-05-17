import { z } from 'zod';

export const progressBaseSchema = z.object({
  id: z.string().cuid(),
  siswaId: z.string().cuid(),
  modulId: z.string().cuid(),
  pretestScore: z.number().int().optional().nullable(),
  posttestScore: z.number().int().optional().nullable(),
  finalScore: z.number().optional().nullable(),
  quizScore: z.number().optional().nullable(),
  status: z.string().min(1).default('IN_PROGRESS'),
  isGraduated: z.boolean().default(false),
  progressPercentage: z.number().min(0).max(100).default(0),
  lastAccessed: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export const createProgressSchema = progressBaseSchema.omit({
  id: true,
  createdAt: true,
  lastAccessed: true,
  pretestScore: true,
  posttestScore: true,
  finalScore: true,
  quizScore: true,
});

export const updateProgressSchema = progressBaseSchema
  .partial()
  .omit({ id: true, siswaId: true, modulId: true });

export type Progress = z.infer<typeof progressBaseSchema>;
export type CreateProgressRecord = z.infer<typeof createProgressSchema>;
export type UpdateProgressRecord = z.infer<typeof updateProgressSchema>;
export type ProgressSchema = typeof progressBaseSchema;
