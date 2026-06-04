import { z } from 'zod';

export const tutorQuizSchema = z.object({
  quiz: z.object({
    materiId: z.string().min(1),
    quizImgQuestionUrl: z.string().nullable().optional(),
    question: z.string().min(1),
    correctAnswer: z.string().min(1),
    skor: z.number().int().default(10),
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

export type TutorQuizPayload = z.infer<typeof tutorQuizSchema>;
