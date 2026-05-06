import { z } from 'zod';

export const tutorBaseSchema = z.object({
  id: z.string().cuid(),
  nama_lengkap: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  bidang_keahlian: z.string().optional().nullable(),
  profile_img: z.string().url().optional().nullable(),
  role: z.string().min(1).default('tutor'),
  googleId: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
});

export const createTutorSchema = tutorBaseSchema.omit({
  id: true,
  createdAt: true,
});

export const updateTutorSchema = tutorBaseSchema.partial().omit({
  id: true,
  email: true,
});

export type Tutor = z.infer<typeof tutorBaseSchema>;
export type CreateTutorRecord = z.infer<typeof createTutorSchema>;
export type UpdateTutorRecord = z.infer<typeof updateTutorSchema>;
