import { Siswa, UpdateSiswaRecord } from '@/validators/user/siswa.validator';
import { prisma } from '../lib/prisma';
import { hashPassword } from '@/lib/auth';
import { Tutor, UpdateTutorRecord } from '@/validators/user/tutor.validator';
import { uploadFileToStorage, UploadFileType } from './upload-file';

export const getUserById = async (
  userId: string,
  role: 'siswa' | 'tutor' | 'admin',
) => {
  try {
    let user;
    if (role === 'siswa') {
      user = await prisma.siswa.findUnique({
        where: {
          id: userId,
        },
      });
    }

    if (role === 'tutor') {
      user = await prisma.tutor.findUnique({
        where: {
          id: userId,
        },
      });
    }

    if (role === 'admin') {
      user = await prisma.admin.findUnique({
        where: {
          id: userId,
        },
      });
    }

    return { ...user, role };
  } catch (err: unknown) {
    throw new Error(err as string);
  }
};

export const updateSiswa = async (userId: string, data: UpdateSiswaRecord) => {
  const payload = data as UpdateSiswaRecord;
  if (payload.password) {
    payload.password = await hashPassword(payload.password);
  }

  try {
    const updatedSiswa = await prisma.siswa.update({
      where: {
        id: userId,
      },
      data: {
        nama_lengkap: payload.nama_lengkap as string,
        jenjang: payload.jenjang as string,
        kelas_sekolah: payload.kelas_sekolah as string,
        password: data.password ?? (payload.password as string),
      },
    });
    return updatedSiswa;
  } catch (err: unknown) {
    throw new Error(err as string);
  }
};

// export const updateTutor = async (userId: string, data: UpdateTutorRecord) => {
//   const payload = data as UpdateTutorRecord;
//   if (payload.password) {
//     payload.password = await hashPassword(payload.password);
//   }

//   if (data.profileImg) {
//     const fileResult = await uploadFileToStorage(
//       {
//         buffer: Buffer.from(data.profileImg, 'base64'),
//         originalname: `profile_${userId}.jpg`,
//         mimetype: 'image/jpeg',
//       },
//       'PROFILE_IMAGE' as UploadFileType,
//     );

//     payload.profileImg = fileResult.publicPath;
//   }

//   if (data.cvPathUrl) {
//     const fileResult = await uploadFileToStorage(
//       {
//         buffer: Buffer.from(data.cvPathUrl, 'base64'),
//         originalname: `cv_${userId}.pdf`,
//         mimetype: 'application/pdf',
//       },
//       'CV_FILE' as UploadFileType,
//     );

//     payload.cvPathUrl = fileResult.publicPath;
//   }

//   try {
//     const updatedTutor = await prisma.tutor.update({
//       where: {
//         id: userId,
//       },
//       data: {
//         fullName: payload.fullName as string,
//         password: data.password ?? (payload.password as string),
//         gender: payload.gender as string,
//         pekerjaan: payload.pekerjaan as string,
//         whatsappNumber: payload.whatsappNumber as string,
//         biografi: payload.biografi as string,
//         lastEducation: payload.lastEducation as string,
//         institution: payload.institution as string,
//         cvPathUrl: payload.cvPathUrl as string,
//         profileImg: payload.profileImg as string,
//       },
//     });
//     return updatedTutor;
//   } catch (error) {
//     throw new Error(error as string);
//   }
// };
