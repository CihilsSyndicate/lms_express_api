import { z } from 'zod';

export const tutorQuizSchema = z.object({
  quiz: z.object({
    topikId: z.string().min(1),
    quizType: z.enum(['REGULER', 'COMPUTATIONAL_THINKING']).default('REGULER'),
    quizImgQuestionUrl: z.string().nullable().optional(),
    question: z.string().min(1),
    correctAnswer: z.string().min(1),
    skor: z.number().int().default(10),
    ctGroupId: z.string().nullable().optional(),
    ctStory: z.string().nullable().optional(),
    ctAspect: z.string().nullable().optional(),
  }),
  answerOptions: z
    .array(
      z.object({
        option: z.string().min(1),
      }),
    )
    .min(1),
  setting: z.object({
    timeLimit: z.number().int().optional().nullable(),
    allowMultipleAttempts: z.boolean().default(false),
    isComputationalThinkingEnabled: z.boolean().default(false),
    minScoreTreshold: z.number().int().optional().nullable(),
    standardScorePerQuestion: z.number().int().default(100),
  }),
});

export const tutorQuizUpdateSchema = z.object({
  question: z.string().min(1).optional(),
  correctAnswer: z.string().min(1).optional(),
  skor: z.number().int().optional(),
  quizType: z.enum(['REGULER', 'COMPUTATIONAL_THINKING']).optional(),
  quizImgQuestionUrl: z.string().nullable().optional(),
  ctGroupId: z.string().nullable().optional(),
  ctStory: z.string().nullable().optional(),
  ctAspect: z.string().nullable().optional(),
  answerOptions: z
    .array(z.object({ option: z.string().min(1) }))
    .optional(),
  setting: z
    .object({
      timeLimit: z.number().int().optional().nullable(),
      allowMultipleAttempts: z.boolean().optional(),
      isComputationalThinkingEnabled: z.boolean().optional(),
      minScoreTreshold: z.number().int().optional().nullable(),
      standardScorePerQuestion: z.number().int().optional(),
    })
    .optional(),
});

export type TutorQuizPayload = z.infer<typeof tutorQuizSchema>;
export type TutorQuizUpdatePayload = z.infer<typeof tutorQuizUpdateSchema>;
