import { z } from 'zod';

export const knowledgeComponentBaseSchema = z.object({
  id: z.string().cuid(),
  modul_id: z.string().cuid(),
  code: z.string().min(1),
  nama: z.string().min(1),
  deskripsi: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
});

export const createKnowledgeComponentSchema = knowledgeComponentBaseSchema.omit({ id: true, createdAt: true });
export const updateKnowledgeComponentSchema = knowledgeComponentBaseSchema.partial().omit({ id: true, modul_id: true });

export type KnowledgeComponent = z.infer<typeof knowledgeComponentBaseSchema>;
export type CreateKnowledgeComponentRecord = z.infer<typeof createKnowledgeComponentSchema>;
export type UpdateKnowledgeComponentRecord = z.infer<typeof updateKnowledgeComponentSchema>;
export type KnowledgeComponentSchema = typeof knowledgeComponentBaseSchema;
