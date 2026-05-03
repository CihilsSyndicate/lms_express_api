import { z } from 'zod';

export const pretestBaseSchema = z.object({
  id: z.string().cuid(),
});

export const createPretestSchema = pretestBaseSchema.omit({ id: true });
export const updatePretestSchema = pretestBaseSchema.partial().omit({ id: true });

export type Pretest = z.infer<typeof pretestBaseSchema>;
export type CreatePretestRecord = z.infer<typeof createPretestSchema>;
export type UpdatePretestRecord = z.infer<typeof updatePretestSchema>;
export type PretestSchema = typeof pretestBaseSchema;
