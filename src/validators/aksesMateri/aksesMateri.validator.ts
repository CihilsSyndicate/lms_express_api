import { z } from 'zod';

export const createAksesMateriSchema = z.object({
  pretestId: z.string().min(1),
  materiId: z.string().min(1),
  minScore: z.number().int().min(0).max(100),
  selectedTopicIds: z.array(z.string()).optional().default([]),
});

export const updateAksesMateriSchema = createAksesMateriSchema
  .partial()
  .omit({ pretestId: true });

export type CreateAksesMateriInput = z.infer<typeof createAksesMateriSchema>;
export type UpdateAksesMateriInput = z.infer<typeof updateAksesMateriSchema>;
