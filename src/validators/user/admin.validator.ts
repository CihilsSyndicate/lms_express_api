import { z } from 'zod';

export const adminBaseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  password: z.string().min(6),
  username: z.string().min(1),
  fullName: z.string().min(1),
  gender: z.string().min(1),
  whatsappNumber: z.string().min(1),
  profileImg: z.url().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  role: z.string().min(1).default('admin'),
});

export const createAdminSchema = adminBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAdminSchema = adminBaseSchema.extend({
  newPassword: z.string().min(6).optional(),
}).partial().omit({
  id: true,
  createdAt: true,
});

export type Admin = z.infer<typeof adminBaseSchema>;
export type CreateAdminRecord = z.infer<typeof createAdminSchema>;
export type UpdateAdminRecord = z.infer<typeof updateAdminSchema>;
export type AdminSchema = typeof adminBaseSchema;
