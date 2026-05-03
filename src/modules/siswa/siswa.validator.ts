import { z } from 'zod';

export const siswaBaseSchema = z.object({
  id: z.string().cuid(),
  nama_lengkap: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  jenjang: z.string().min(1),
  kelas_sekolah: z.string().min(1),
  profile_img: z.string().url().optional().nullable(),
  role: z.string().min(1).default('siswa'),
  googleId: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
});

export const createSiswaSchema = siswaBaseSchema.omit({
  id: true,
  createdAt: true,
});

export const updateSiswaSchema = siswaBaseSchema.partial().omit({
  id: true,
  email: true,
});

export type Siswa = z.infer<typeof siswaBaseSchema>;
export type CreateSiswaRecord = z.infer<typeof createSiswaSchema>;
export type UpdateSiswaRecord = z.infer<typeof updateSiswaSchema>;
export type SiswaSchema = typeof siswaBaseSchema;
