import { z } from 'zod';

export const moduleUnlockRuleBaseSchema = z.object({
  id: z.string().cuid(),
  modul_id: z.string().cuid(),
  target_type: z.string().min(1),
  target_id: z.string().min(1),
  knowledge_component_id: z.string().cuid(),
  mastery_threshold: z.number().default(0.8),
  minimum_pretest_score: z.number().int().optional().nullable(),
});

export const createModuleUnlockRuleSchema = moduleUnlockRuleBaseSchema.omit({ id: true });
export const updateModuleUnlockRuleSchema = moduleUnlockRuleBaseSchema.partial().omit({ id: true, modul_id: true, knowledge_component_id: true });

export type ModuleUnlockRule = z.infer<typeof moduleUnlockRuleBaseSchema>;
export type CreateModuleUnlockRuleRecord = z.infer<typeof createModuleUnlockRuleSchema>;
export type UpdateModuleUnlockRuleRecord = z.infer<typeof updateModuleUnlockRuleSchema>;
export type ModuleUnlockRuleSchema = typeof moduleUnlockRuleBaseSchema;
