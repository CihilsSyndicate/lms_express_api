import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../lib/auth';
import { CreateTutorRecord } from './tutor.validator';

export class TutorService {
  async register(data: CreateTutorRecord) {
    const existingTutor = await prisma.tutor.findUnique({
      where: { email: data.email },
    });
    if (existingTutor) {
      throw new Error('Email sudah terdaftar (Tutor).');
    }

    const { password, ...registerData } = data;
    const hashedPassword = await hashPassword(password);

    // Filter out undefined values for Prisma
    const prismaData = JSON.parse(JSON.stringify({
      ...registerData,
      password: hashedPassword,
    }));

    return await prisma.tutor.create({
      data: prismaData,
    });
  }
}
