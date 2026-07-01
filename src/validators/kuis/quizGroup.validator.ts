import { z } from 'zod';

export const quizGroupBaseSchema = z.object({
  id: z.string().cuid(),
  topikId: z.string(),
  nama: z.string(),
  quizType: z.enum(['REGULER', 'COMPUTATIONAL_THINKING']).default('REGULER'),
});

export const createQuizGroupSchema = quizGroupBaseSchema.omit({
  id: true,
});

export const updateQuizGroupSchema = quizGroupBaseSchema
  .omit({
    id: true,
  })
  .partial();

export type QuizGroup = z.infer<typeof quizGroupBaseSchema>;
export type CreateQuizGroupInput = z.infer<typeof createQuizGroupSchema>;
export type UpdateQuizGroupInput = z.infer<typeof updateQuizGroupSchema>;
