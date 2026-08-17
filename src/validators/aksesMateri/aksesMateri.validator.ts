import { z } from 'zod';

const baseAksesMateriSchema = z.object({
  pretestId: z.string().min(1).optional(),
  posttestId: z.string().min(1).optional(),
  materiId: z.string().min(1).optional(),
  minScore: z.number().int().min(0).max(100),
  selectedTopicIds: z.array(z.string()).optional().default([]),
});

export const createAksesMateriSchema = baseAksesMateriSchema.refine(
  (data) => Boolean(data.pretestId) !== Boolean(data.posttestId),
  { message: 'Salah satu pretestId atau posttestId wajib diisi.' },
);

export const updateAksesMateriSchema = baseAksesMateriSchema
  .partial()
  .omit({ pretestId: true, posttestId: true });

export type CreateAksesMateriInput = z.infer<typeof createAksesMateriSchema>;
export type UpdateAksesMateriInput = z.infer<typeof updateAksesMateriSchema>;
