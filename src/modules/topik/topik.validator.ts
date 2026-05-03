import { z } from 'zod';

export const topikBaseSchema = z.object({
  id: z.string().cuid(),
  nama: z.string().min(1),
  modul_id: z.string().cuid(),
});

export const createTopikSchema = topikBaseSchema.omit({ id: true });
export const updateTopikSchema = topikBaseSchema.partial().omit({ id: true, modul_id: true });

export type Topik = z.infer<typeof topikBaseSchema>;
export type CreateTopikRecord = z.infer<typeof createTopikSchema>;
export type UpdateTopikRecord = z.infer<typeof updateTopikSchema>;
export type TopikSchema = typeof topikBaseSchema;
