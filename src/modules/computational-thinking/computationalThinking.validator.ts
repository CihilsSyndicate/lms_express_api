import { z } from 'zod';

export const computationalThinkingBaseSchema = z.object({
  id: z.string().cuid(),
  modul_id: z.string().cuid(),
  aspek: z.string().min(1),
  deskripsi: z.string().optional().nullable(),
});

export const createComputationalThinkingSchema = computationalThinkingBaseSchema.omit({ id: true });
export const updateComputationalThinkingSchema = computationalThinkingBaseSchema.partial().omit({ id: true, modul_id: true });

export type ComputationalThinking = z.infer<typeof computationalThinkingBaseSchema>;
export type CreateComputationalThinkingRecord = z.infer<typeof createComputationalThinkingSchema>;
export type UpdateComputationalThinkingRecord = z.infer<typeof updateComputationalThinkingSchema>;
export type ComputationalThinkingSchema = typeof computationalThinkingBaseSchema;
