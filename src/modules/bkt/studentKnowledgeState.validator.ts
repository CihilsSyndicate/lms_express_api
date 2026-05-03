import { z } from 'zod';

export const studentKnowledgeStateBaseSchema = z.object({
  id: z.string().cuid(),
  siswa_id: z.string().cuid(),
  modul_id: z.string().cuid(),
  knowledge_component_id: z.string().cuid(),
  p_init: z.number().default(0.2),
  p_learn: z.number().default(0.3),
  p_guess: z.number().default(0.1),
  p_slip: z.number().default(0.1),
  p_mastery_current: z.number().default(0.2),
  last_updated: z.coerce.date(),
});

export const createStudentKnowledgeStateSchema = studentKnowledgeStateBaseSchema.omit({ id: true, last_updated: true });
export const updateStudentKnowledgeStateSchema = studentKnowledgeStateBaseSchema.partial().omit({ id: true, siswa_id: true, modul_id: true, knowledge_component_id: true });

export type StudentKnowledgeState = z.infer<typeof studentKnowledgeStateBaseSchema>;
export type CreateStudentKnowledgeStateRecord = z.infer<typeof createStudentKnowledgeStateSchema>;
export type UpdateStudentKnowledgeStateRecord = z.infer<typeof updateStudentKnowledgeStateSchema>;
export type StudentKnowledgeStateSchema = typeof studentKnowledgeStateBaseSchema;
