import { z } from 'zod';

export const ratingBaseSchema = z.object({
  id: z.string().cuid(),
  siswa_id: z.string(),
  modul_id: z.string(),
  rating: z.number().int().min(1).max(5),
  komentar: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ratingCreateSchema = ratingBaseSchema.omit({
  id: true,
  siswa_id: true,
  modul_id: true,
  createdAt: true,
  updatedAt: true,
});

export const ratingUpdateSchema = ratingBaseSchema
  .omit({
    id: true,
    siswa_id: true,
    modul_id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export type Rating = z.infer<typeof ratingBaseSchema>;
export type CreateRatingRecord = z.infer<typeof ratingCreateSchema>;
export type UpdateRatingRecord = z.infer<typeof ratingUpdateSchema>;
export type RatingSchema = typeof ratingBaseSchema;
