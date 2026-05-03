import { z } from 'zod';

export const pretestQuestionSkillMapBaseSchema = z.object({
  id: z.string().cuid(),
  soal_pretest_id: z.string().cuid(),
  knowledge_component_id: z.string().cuid(),
  weight: z.number().default(1.0),
});

export const createPretestQuestionSkillMapSchema = pretestQuestionSkillMapBaseSchema.omit({ id: true });
export const updatePretestQuestionSkillMapSchema = pretestQuestionSkillMapBaseSchema.partial().omit({ id: true, soal_pretest_id: true, knowledge_component_id: true });

export type PretestQuestionSkillMap = z.infer<typeof pretestQuestionSkillMapBaseSchema>;
export type CreatePretestQuestionSkillMapRecord = z.infer<typeof createPretestQuestionSkillMapSchema>;
export type UpdatePretestQuestionSkillMapRecord = z.infer<typeof updatePretestQuestionSkillMapSchema>;
export type PretestQuestionSkillMapSchema = typeof pretestQuestionSkillMapBaseSchema;
