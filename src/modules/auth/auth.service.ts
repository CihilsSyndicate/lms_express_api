import { prisma } from '../../lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { UserTokenPayload } from '@/lib/auth';
import type {
  CreateSiswaRecord,
  UpdateSiswaRecord,
} from '@/validators/user/siswa.validator';
import { hashPassword } from '@/lib/auth';
import {
  CreateTutorRecord,
  UpdateTutorRecord,
} from '@/validators/user/tutor.validator';
import {
  CreateAdminRecord,
  UpdateAdminRecord,
} from '@/validators/user/admin.validator';

export class AuthService {
  async login(email: string, password: string) {
    let foundUser: any = null;
    let role: 'siswa' | 'tutor' | 'admin' = 'siswa';

    const siswa = await prisma.siswa.findUnique({ where: { email } });

    if (siswa) {
      const isMatch = await comparePassword(password, siswa.password);
      if (!isMatch) return null;
      foundUser = siswa;
      role = 'siswa';
    } else {
      const tutor = await prisma.tutor.findUnique({ where: { email } });
      if (tutor) {
        if (!tutor) return null;

        const isMatch = await comparePassword(password, tutor.password);
        if (!isMatch) return null;

        foundUser = tutor;
        role = 'tutor';
      } else {
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (!admin) return null;
        const isMatch = await comparePassword(password, admin.password);
        if (!isMatch) return null;
        foundUser = admin;
        role = 'admin';
      }
    }

    const tokenPayload: UserTokenPayload = {
      id: foundUser.id,
      name: role === 'siswa' ? foundUser.nama_lengkap : foundUser.fullName,
      email: foundUser.email,
      role,
    };

    const tokens = generateToken(tokenPayload);
    const { password: _, ...userWithoutPassword } = foundUser;

    return {
      user: { ...userWithoutPassword, role },
      role,
      tokens,
    };
  }

  async getCurrentUser(userId: string, role: 'siswa' | 'tutor' | 'admin') {
    let user;
    if (role === 'siswa') {
      user = await prisma.siswa.findUnique({ where: { id: userId } });
    } else if (role === 'tutor') {
      user = await prisma.tutor.findUnique({ where: { id: userId } });
    } else {
      user = await prisma.admin.findUnique({ where: { id: userId } });
    }

    if (!user) return null;
    const { password: _, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, role };
  }

  async verifyPassword(
    userId: string,
    role: 'siswa' | 'tutor' | 'admin',
    password: string,
  ) {
    try {
      let user;
      if (role === 'siswa') {
        user = await prisma.siswa.findUnique({ where: { id: userId } });
      } else if (role === 'tutor') {
        user = await prisma.tutor.findUnique({ where: { id: userId } });
      } else {
        user = await prisma.admin.findUnique({ where: { id: userId } });
      }

      if (!user) {
        throw new Error('User tidak ditemukan.');
      }

      const isMatch = await comparePassword(password, user.password);
      return isMatch;
    } catch (err) {
      console.error(
        '[PASSWORD-VERIFY-ERROR] Gagal memverifikasi password:',
        err,
      );
      throw new Error('Gagal memverifikasi password.' + err);
    }
  }

  async updateUserProfile(
    userId: string,
    data: UpdateSiswaRecord | UpdateTutorRecord | UpdateAdminRecord,
  ) {
    try {
      if (
        !(await this.verifyPassword(
          userId,
          data?.role as 'siswa' | 'tutor' | 'admin',
          data.password as string,
        ))
      ) {
        throw new Error('Password tidak cocok. periksa kembali password anda.');
      }
      let updatedUser;
      if (data.role === 'siswa') {
        updatedUser = await this.updateStudentProfile(
          userId,
          data as UpdateSiswaRecord,
        );
      } else if (data.role === 'tutor') {
        updatedUser = await this.updateTutorProfile(
          userId,
          data as UpdateTutorRecord,
        );
      } else {
        updatedUser = await this.updateAdminProfile(
          userId,
          data as UpdateAdminRecord,
        );
      }

      return updatedUser;
    } catch (error) {
      console.error(
        '[PROFILE-UPDATE-ERROR] Gagal memperbarui profil siswa:',
        error,
      );
      throw new Error('Gagal memperbarui profil siswa.');
    }
  }

  async updateStudentProfile(userId: string, data: UpdateSiswaRecord) {
    try {
      if (
        !(await this.verifyPassword(userId, 'siswa', data.password as string))
      ) {
        throw new Error('Password tidak cocok. periksa kembali password anda.');
      }

      data.password = await hashPassword(data.password as string);

      const updatedSiswa = await prisma.siswa.update({
        where: { id: userId },
        data: {
          data,
        },
      });

      return updatedSiswa;
    } catch (error) {
      throw new Error('Gagal memperbarui profil siswa.' + error);
    }
  }

  async updateTutorProfile(userId: string, data: UpdateTutorRecord) {
    try {
      if (
        !(await this.verifyPassword(userId, 'tutor', data.password as string))
      ) {
        throw new Error('Password tidak cocok. periksa kembali password anda.');
      }

      data.password = await hashPassword(data.password as string);

      const updatedTutor = await prisma.tutor.update({
        where: { id: userId },
        data: {
          data,
        },
      });

      return updatedTutor;
    } catch (error) {
      throw new Error('Gagal memperbarui profil tutor.' + error);
    }
  }

  async updateAdminProfile(userId: string, data: UpdateAdminRecord) {
    try {
      if (
        !(await this.verifyPassword(userId, 'admin', data.password as string))
      ) {
        throw new Error('Password tidak cocok. periksa kembali password anda.');
      }

      data.password = await hashPassword(data.password as string);

      const updatedAdmin = await prisma.admin.update({
        where: { id: userId },
        data: {
          data,
        },
      });
    } catch (error) {
      throw new Error('Gagal memperbarui profil admin.' + error);
    }
  }

  async registerUser(
    data: CreateAdminRecord | CreateSiswaRecord | CreateTutorRecord,
    role: 'siswa' | 'tutor' | 'admin',
  ) {
    try {
      let newUser;
      if (role === 'siswa') {
        newUser = await this.registerSiswa(data as CreateSiswaRecord);
      } else if (role === 'tutor') {
        newUser = await this.registerTutor(data as CreateTutorRecord);
      } else {
        throw new Error(
          'Registrasi untuk role admin tidak diizinkan melalui metode ini.',
        );
      }
      return newUser;
    } catch (error) {
      console.error('[REGISTER-USER-ERROR] Gagal mendaftarkan user:', error);
      throw new Error('Gagal mendaftarkan user.' + error);
    }
  }

  async registerSiswa(data: CreateSiswaRecord) {
    try {
      const existingSiswa = await prisma.siswa.findUnique({
        where: { email: data.email },
      });
      if (existingSiswa) {
        throw new Error('Email sudah terdaftar. Silakan gunakan email lain.');
      }
      data.password = await hashPassword(data.password);
      const newSiswa = await prisma.siswa.create({
        data,
      });
      return newSiswa;
    } catch (error) {
      console.error('[REGISTER-SISWA-ERROR] Gagal mendaftarkan siswa:', error);
      throw new Error('Gagal mendaftarkan siswa.' + error);
    }
  }

  async registerTutor(data: CreateTutorRecord) {
    try {
      const existingTutor = await prisma.tutor.findUnique({
        where: { email: data.email },
      });
      if (existingTutor) {
        throw new Error('Email sudah terdaftar. Silakan gunakan email lain.');
      }
      data.password = await hashPassword(data.password);
      const newTutor = await prisma.tutor.create({
        data: {
          ...data,
          role: 'tutor',
          profileImg: data.profileImg ?? null,
          biografi: data.biografi ?? null,
        },
      });

      return newTutor;
    } catch (error) {
      console.error('[REGISTER-TUTOR-ERROR] Gagal mendaftarkan tutor:', error);
      throw new Error('Gagal mendaftarkan tutor.' + error);
    }
  }
}
