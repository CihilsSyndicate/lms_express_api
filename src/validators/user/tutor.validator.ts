import { z } from 'zod';

export const tutorBaseSchema = z.object({
  id: z.cuid(),
  fullName: z.string().min(1),
  email: z.email(),
  password: z.string().min(1),
  gender: z.string().optional().nullable(),
  pekerjaan: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  lastEducation: z.string().optional().nullable(),
  institution: z.string().optional().nullable(),
  biografi: z.string().optional().nullable(),
  prodi: z.string().optional().nullable(),
  cvPathUrl: z.string().optional().nullable(),
  profileImg: z.string().optional().nullable(),
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
