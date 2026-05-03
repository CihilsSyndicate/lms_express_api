import { z } from 'zod';

export const modulBaseSchema = z.object({
  id: z.string().cuid(),
  nama_modul: z.string().min(1),
  deskripsi: z.string().min(1),
  target_waktu: z.number().int(),
  tingkat_kesulitan: z.string().min(1),
  is_berbayar: z.boolean().default(false),
  harga_modul: z.number().optional().nullable(),
  jenjang: z.string().min(1),
  kelas_sekolah: z.string().min(1),
  tutor_id: z.string().cuid(),
  pretest_id: z.string().cuid().optional().nullable(),
  posttest_id: z.string().cuid().optional().nullable(),
});

export const createModulSchema = modulBaseSchema.omit({ id: true });
export const updateModulSchema = modulBaseSchema.partial().omit({ id: true, tutor_id: true });

export type Modul = z.infer<typeof modulBaseSchema>;
export type CreateModulRecord = z.infer<typeof createModulSchema>;
export type UpdateModulRecord = z.infer<typeof updateModulSchema>;
export type ModulSchema = typeof modulBaseSchema;
