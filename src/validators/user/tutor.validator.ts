import { z } from 'zod';

export const tutorBaseSchema = z.object({
  id: z.cuid(),
  fullName: z.string().min(1),
  email: z.email(),
  password: z.string().min(1),
  gender: z.string().min(1),
  pekerjaan: z.string().min(1),
  whatsappNumber: z.string().min(1),
  lastEducation: z.string().min(1),
  institution: z.string().min(1),
  biografi: z.string().optional().nullable(),
  prodi: z.string().min(1),
  cvPathUrl: z.url(),
  profileImg: z.url().optional().nullable(),
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
