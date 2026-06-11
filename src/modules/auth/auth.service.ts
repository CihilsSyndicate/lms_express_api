import { prisma } from '../../lib/prisma';
import {
  comparePassword,
  generateToken,
  generateResetToken,
  verifyResetToken,
  hashPassword,
} from '@/lib/auth';
import { UserTokenPayload } from '@/lib/auth';
import type {
  CreateSiswaRecord,
  UpdateSiswaRecord,
} from '@/validators/user/siswa.validator';
import {
  CreateTutorRecord,
  UpdateTutorRecord,
} from '@/validators/user/tutor.validator';
import {
  CreateAdminRecord,
  UpdateAdminRecord,
} from '@/validators/user/admin.validator';

export const loginService = async (email: string, password: string) => {
  let foundUser: any = null;
  let role: 'siswa' | 'tutor' | 'admin' | 'umum';

  const siswa = await prisma.siswa.findUnique({ where: { email } });

  if (siswa) {
    const isMatch = await comparePassword(password, siswa.password);
    if (!isMatch) return null;
    foundUser = siswa;
    role = siswa.role as 'siswa' | 'umum';
  } else {
    const tutor = await prisma.tutor.findUnique({ where: { email } });
    if (tutor) {
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
    name:
      role === 'siswa' || role === 'umum'
        ? foundUser.nama_lengkap
        : foundUser.fullName,
    email: foundUser.email,
    role: role as 'siswa' | 'tutor' | 'admin' | 'umum',
  };

  const tokens = generateToken(tokenPayload);
  const { password: _, ...userWithoutPassword } = foundUser;

  return {
    payload: {
      user: { ...userWithoutPassword, role },
      role,
    },
    tokens,
  };
};

export const verifyPasswordService = async (
  userId: string,
  role: 'siswa' | 'tutor' | 'admin' | 'umum',
  password: string,
) => {
  try {
    let user;
    if (role === 'siswa' || role === 'umum') {
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
    console.error('[PASSWORD-VERIFY-ERROR] Gagal memverifikasi password:', err);
    throw new Error('Gagal memverifikasi password.' + err);
  }
};

export const updateUserProfileService = async (
  userId: string,
  data: UpdateSiswaRecord | UpdateTutorRecord | UpdateAdminRecord,
) => {
  try {
    if (
      !(await verifyPasswordService(
        userId,
        data?.role as 'siswa' | 'tutor' | 'admin',
        data.password as string,
      ))
    ) {
      throw new Error('Password tidak cocok. periksa kembali password anda.');
    }
    let updatedUser;
    if (data.role === 'siswa') {
      updatedUser = await updateStudentProfileService(
        userId,
        data as UpdateSiswaRecord,
      );
    } else if (data.role === 'tutor') {
      updatedUser = await updateTutorProfileService(
        userId,
        data as UpdateTutorRecord,
      );
    } else {
      updatedUser = await updateAdminProfileService(
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
};

export const updateStudentProfileService = async (
  userId: string,
  data: UpdateSiswaRecord,
) => {
  try {
    if (
      !(await verifyPasswordService(userId, 'siswa', data.password as string))
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
};

export const updateTutorProfileService = async (
  userId: string,
  data: UpdateTutorRecord,
) => {
  try {
    if (
      !(await verifyPasswordService(userId, 'tutor', data.password as string))
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
};

export const updateAdminProfileService = async (
  userId: string,
  data: UpdateAdminRecord,
) => {
  try {
    if (
      !(await verifyPasswordService(userId, 'admin', data.password as string))
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
    return updatedAdmin;
  } catch (error) {
    throw new Error('Gagal memperbarui profil admin.' + error);
  }
};

export const registerUserService = async (
  data: CreateAdminRecord | CreateSiswaRecord | CreateTutorRecord,
  role: 'siswa' | 'tutor' | 'admin' | 'umum',
) => {
  try {
    let newUser;
    if (role === 'siswa' || role === 'umum') {
      newUser = await registerSiswaService(data as CreateSiswaRecord);
    } else if (role === 'tutor') {
      newUser = await registerTutorService(data as CreateTutorRecord);
    } else {
      throw new Error(
        'Registrasi untuk role admin tidak diizinkan melalui metode ini.',
      );
    }
    return newUser;
  } catch (error: unknown) {
    console.error('[REGISTER-USER-ERROR] Gagal mendaftarkan user:', error);
    throw new Error(
      error instanceof Error ? error.message : 'An unknown error occurred',
    );
  }
};

export const registerSiswaService = async (data: CreateSiswaRecord) => {
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
  } catch (error: unknown) {
    console.error('[REGISTER-SISWA-ERROR] Gagal mendaftarkan siswa:', error);
    throw new Error(
      error instanceof Error ? error.message : 'An unknown error occurred',
    );
  }
};

export const registerTutorService = async (data: CreateTutorRecord) => {
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
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: 'tutor',
        gender: data.gender ?? '',
        pekerjaan: data.pekerjaan ?? '',
        whatsappNumber: data.whatsappNumber ?? '',
        lastEducation: data.lastEducation ?? '',
        institution: data.institution ?? '',
        prodi: data.prodi ?? '',
        cvPathUrl: data.cvPathUrl ?? '',
        profileImg: data.profileImg ?? null,
        biografi: data.biografi ?? null,
      },
    });

    return newTutor;
  } catch (error) {
    console.error('[REGISTER-TUTOR-ERROR] Gagal mendaftarkan tutor:', error);
    throw new Error('Gagal mendaftarkan tutor.' + error);
  }
};

export const deleteStudentService = async (studentId: string) => {
  await prisma.siswa.delete({
    where: {
      id: studentId,
    },
  });

  return { message: 'Siswa deleted successfully' };
};

export const deactivateStudentService = async (studentId: string) => {
  return prisma.siswa.update({
    where: {
      id: studentId,
    },
    data: {
      isActive: false,
    },
  });
};

export const forgotPasswordService = async (email: string) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Email tidak ditemukan.');

  const resetToken = generateResetToken(user.email, user.role);

  return { message: 'Link reset password telah dikirim ke email.', resetToken };
};

export const resetPasswordService = async (
  token: string,
  newPassword: string,
) => {
  let payload: { email: string; role: string };
  try {
    payload = verifyResetToken(token);
  } catch {
    throw new Error('Token tidak valid atau kadaluarsa.');
  }

  const { email, role } = payload;
  const hashed = await hashPassword(newPassword);

  if (role === 'siswa' || role === 'umum') {
    await prisma.siswa.update({ where: { email }, data: { password: hashed } });
  } else if (role === 'tutor') {
    await prisma.tutor.update({ where: { email }, data: { password: hashed } });
  } else if (role === 'admin') {
    await prisma.admin.update({ where: { email }, data: { password: hashed } });
  } else {
    throw new Error('Role tidak dikenal.');
  }
};

const findUserByEmail = async (email: string) => {
  const siswa = await prisma.siswa.findUnique({ where: { email } });
  if (siswa) return { ...siswa, role: 'siswa' };

  const tutor = await prisma.tutor.findUnique({ where: { email } });
  if (tutor) return { ...tutor, role: 'tutor' };

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (admin) return { ...admin, role: 'admin' };

  return null;
};

export const activateStudentService = async (studentId: string) => {
  return prisma.siswa.update({
    where: {
      id: studentId,
    },
    data: {
      isActive: true,
    },
  });
};

export const deleteTutorService = async (tutorId: string) => {
  await prisma.tutor.delete({
    where: {
      id: tutorId,
    },
  });

  return { message: 'Tutor deleted successfully' };
};

export const deactivateTutorService = async (tutorId: string) => {
  return prisma.tutor.update({
    where: {
      id: tutorId,
    },
    data: {
      isActive: false,
    },
  });
};
