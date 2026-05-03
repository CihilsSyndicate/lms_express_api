import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/auth';
import { CreateSiswaRecord } from './siswa.validator';

export class SiswaService {
  async register(data: CreateSiswaRecord) {
    const existingSiswa = await prisma.siswa.findUnique({
      where: { email: data.email },
    });
    if (existingSiswa) {
      throw new Error('Email sudah terdaftar (Siswa).');
    }

    const { password, ...registerData } = data;
    const hashedPassword = await hashPassword(password);

    // Filter out undefined values for Prisma
    const prismaData = JSON.parse(JSON.stringify({
      ...registerData,
      password: hashedPassword,
    }));

    return await prisma.siswa.create({
      data: prismaData,
    });
  }
}
