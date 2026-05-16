import { prisma } from '@/lib/prisma';

export const getStudentCertificates = async (userId: string) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: {
        siswaId: userId,
        progress: {
          status: 'completed',
        },
      },
      include: {
        modul: {
          select: {
            moduleName: true,
            level: true,
            class: true,
          },
        },
        progress: {
          select: {
            status: true,
            updatedAt: true,
          },
        },
      },
    });
    return certificates;
  } catch (error) {
    throw new Error(`Gagal mengambil sertifikat: ${error}`);
  }
};

export const getStudentCertificateById = async (certificateId: string) => {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId, progress: { status: 'completed' } },
      include: {
        siswa: true,
        modul: {
          include: {
            progress: true,
          },
        },
      },
    });

    return certificate;
  } catch (error) {
    throw new Error(`Gagal mengambil sertifikat: ${error}`);
  }
};
