import { z } from 'zod';

export const modulBaseSchema = z.object({
  id: z.string().cuid(),
  moduleName: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  targetTime: z.number().int(),
  difficulty: z.string().min(1),
  isPaid: z.boolean().default(false),
  modulPrice: z.number().optional().default(0),
  level: z.string().min(1).optional(),
  class: z.string().min(1).optional(),
  modulType: z.enum(['SISWA', 'UMUM']).default('SISWA'),
  tutorId: z.string().cuid(),
  pretestId: z.string().cuid().optional().nullable(),
  posttestId: z.string().cuid().optional().nullable(),
});

export const createModulSchema = modulBaseSchema.omit({
  id: true,
  pretestId: true,
  posttestId: true,
});
export const updateModulSchema = modulBaseSchema
  .partial()
  .omit({ id: true, tutorId: true });

export type Modul = z.infer<typeof modulBaseSchema>;
export type CreateModulRecord = z.infer<typeof createModulSchema>;
export type UpdateModulRecord = z.infer<typeof updateModulSchema>;
export type ModulSchema = typeof modulBaseSchema;
