import { z } from 'zod';

export const tutorBaseSchema = z.object({
  id: z.string().cuid(),
  nama_lengkap: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  gender: z.string().min(1),
  pekerjaan: z.string().min(1),
  no_whatsapp: z.string().min(1),
  pendidikan_terakhir: z.string().min(1),
  nama_instansi: z.string().min(1),
  prodi: z.string().min(1),
  cv_path_url: z.string().url(),
  profile_img: z.string().url().optional().nullable(),
  role: z.string().min(1).default('tutor'),
  googleId: z.string().optional().nullable(),
});

export const createTutorSchema = tutorBaseSchema.omit({ id: true });
export const updateTutorSchema = tutorBaseSchema.partial().omit({ id: true, email: true });

export type Tutor = z.infer<typeof tutorBaseSchema>;
export type CreateTutorRecord = z.infer<typeof createTutorSchema>;
export type UpdateTutorRecord = z.infer<typeof updateTutorSchema>;
export type TutorSchema = typeof tutorBaseSchema;
