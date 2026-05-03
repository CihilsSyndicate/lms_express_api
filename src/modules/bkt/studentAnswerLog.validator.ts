import { z } from 'zod';

export const studentAnswerLogBaseSchema = z.object({
  id: z.string().cuid(),
  siswa_id: z.string().cuid(),
  modul_id: z.string().cuid(),
  question_source: z.string().min(1),
  question_id: z.string().min(1),
  knowledge_component_id: z.string().cuid().optional().nullable(),
  is_correct: z.boolean(),
  attempt_no: z.number().int().default(1),
  answered_at: z.coerce.date(),
});

export const createStudentAnswerLogSchema = studentAnswerLogBaseSchema.omit({ id: true, answered_at: true });
export const updateStudentAnswerLogSchema = studentAnswerLogBaseSchema.partial().omit({ id: true, siswa_id: true, modul_id: true, question_id: true });

export type StudentAnswerLog = z.infer<typeof studentAnswerLogBaseSchema>;
export type CreateStudentAnswerLogRecord = z.infer<typeof createStudentAnswerLogSchema>;
export type UpdateStudentAnswerLogRecord = z.infer<typeof updateStudentAnswerLogSchema>;
export type StudentAnswerLogSchema = typeof studentAnswerLogBaseSchema;
