import { z } from 'zod';

export const tutorBaseSchema = z.object({
  id: z.cuid(),
  fullName: z.string().min(1),
  email: z.email(),
  password: z.string().min(1),
  gender: z.string(),
  pekerjaan: z.string(),
  whatsappNumber: z.string(),
  lastEducation: z.string(),
  institution: z.string(),
  biografi: z.string().optional(),
  prodi: z.string(),
  cvPathUrl: z.string(),
  profileImg: z.string(),
  role: z.string().min(1).default('tutor'),
  // googleId: z.string().optional().nullable(),
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
