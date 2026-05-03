import { z } from 'zod';

export const posttestBaseSchema = z.object({
  id: z.string().cuid(),
});

export const createPosttestSchema = posttestBaseSchema.omit({ id: true });
export const updatePosttestSchema = posttestBaseSchema.partial().omit({ id: true });

export type Posttest = z.infer<typeof posttestBaseSchema>;
export type CreatePosttestRecord = z.infer<typeof createPosttestSchema>;
export type UpdatePosttestRecord = z.infer<typeof updatePosttestSchema>;
export type PosttestSchema = typeof posttestBaseSchema;
