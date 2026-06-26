import { z } from 'zod';

// Quiz Validator
export const quizSchema = z.object({
  id: z.string().cuid(),
  topikId: z.string(),
  quizType: z.enum(['REGULER', 'COMPUTATIONAL_THINKING']).default('REGULER'),
  quizImgQuestionUrl: z.string().optional().nullable(),
  question: z.string(),
  correctAnswer: z.string(),
  skor: z.number().int().default(10),
  ctGroupId: z.string().optional().nullable(),
  ctStory: z.string().optional().nullable(),
  ctAspect: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createQuizSchema = quizSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateQuizSchema = quizSchema
  .omit({
    id: true,
    topikId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export type Quiz = z.infer<typeof quizSchema>;
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;

// QuizAnswerOption Validator
export const quizAnswerOptionSchema = z.object({
  id: z.string().cuid(),
  quizId: z.string(),
  option: z.string(),
  createdAt: z.date(),
});

export const createQuizAnswerOptionSchema = quizAnswerOptionSchema.omit({
  id: true,
  createdAt: true,
});

export const updateQuizAnswerOptionSchema = quizAnswerOptionSchema
  .omit({
    id: true,
    quizId: true,
    createdAt: true,
  })
  .partial();

export type QuizAnswerOption = z.infer<typeof quizAnswerOptionSchema>;
export type CreateQuizAnswerOptionInput = z.infer<
  typeof createQuizAnswerOptionSchema
>;
export type UpdateQuizAnswerOptionInput = z.infer<
  typeof updateQuizAnswerOptionSchema
>;

// QuizSetting Validator
export const quizSettingSchema = z.object({
  id: z.string().cuid(),
  quizId: z.string(),
  timeLimit: z.number().int().optional().nullable(),
  allowMultipleAttempts: z.boolean().default(false),
  isComputationalThinkingEnabled: z.boolean().default(false),
  minScoreTreshold: z.number().int().optional().nullable(),
  standardScorePerQuestion: z.number().int().default(100),
  createdAt: z.date(),
});

export const createQuizSettingSchema = quizSettingSchema.omit({
  id: true,
  createdAt: true,
});

export const updateQuizSettingSchema = quizSettingSchema
  .omit({
    id: true,
    quizId: true,
    createdAt: true,
  })
  .partial();

export type QuizSetting = z.infer<typeof quizSettingSchema>;
export type CreateQuizSettingInput = z.infer<typeof createQuizSettingSchema>;
export type UpdateQuizSettingInput = z.infer<typeof updateQuizSettingSchema>;

export interface QuizPayload {
  quiz: CreateQuizInput;
  answerOptions: CreateQuizAnswerOptionInput[];
  setting: CreateQuizSettingInput;
}
