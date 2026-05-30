import { prisma } from '@/lib/prisma';
import {
  buildCursorPaginatedResponse,
  buildCursorWhere,
  decodeCursor,
} from './pagination';

export const getStudentCertificates = async (
  userId: string,
  limit: number = 10,
  cursor?: string,
) => {
  try {
    const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
    const cursorWhere = buildCursorWhere(cursorPayload);

    const certificates = await prisma.certificate.findMany({
      where: {
        AND: [
          {
            siswaId: userId,
          },
          cursorWhere,
        ],
      },
      include: {
        modul: {
          select: {
            moduleName: true,
            tutor: {
              select: {
                fullName: true,
                signatures: true,
              },
            },
          },
        },
      },
    });

    return buildCursorPaginatedResponse(certificates, limit, (item) => ({
      createdAt: item.createdAt,
      id: item.id,
    }));
  } catch (error) {
    throw new Error(`Gagal mengambil sertifikat: ${error}`);
  }
};

export const getStudentCertificateById = async (certificateId: string) => {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
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
