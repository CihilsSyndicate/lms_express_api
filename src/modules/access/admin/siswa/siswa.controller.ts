import { Request, Response } from 'express';
import {
  deactivateStudentService,
  deleteStudentService,
  registerUserService,
  activateStudentService,
} from '@/modules/auth/auth.service';
import { prisma } from '@/lib/prisma';
import {
  parsePaginationQuery,
  decodeCursor,
  buildCursorWhere,
  buildCursorPaginatedResponse,
} from '@/utils/pagination';

export const searchSiswa = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      return res
        .status(400)
        .json({ message: 'Kata kunci minimal 2 karakter.' });
    }

    const siswa = await prisma.siswa.findMany({
      where: {
        OR: [
          { nama_lengkap: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(siswa);
  } catch (error) {
    console.error('[SEARCH-SISWA-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllSiswa = async (req: Request, res: Response) => {
  try {
    const { limit, cursor } = parsePaginationQuery(req.query);
    const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
    const where = buildCursorWhere(cursorPayload);

    const siswaList = await prisma.siswa.findMany({
      where,
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    const result = buildCursorPaginatedResponse(siswaList, limit, (item) => ({
      createdAt: item.createdAt,
      id: item.id,
    }));

    res.status(200).json(result);
  } catch (error: any) {
    if (
      error.message === 'Invalid limit parameter' ||
      error.message === 'Invalid cursor'
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error fetching siswa list:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const registerSiswa = async (req: Request, res: Response) => {
  try {
    const payload = await registerUserService(req.body, 'siswa');

    res.status(201).json(payload);
  } catch (error) {
    console.error('Error registering siswa:', error);

    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const updateSiswa = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { nama_lengkap, email, password, jenjang, kelas_sekolah, studentType, profileImage, role } =
      req.body;

    let hashedPassword;
    if (password) {
      const { hashPassword } = await import('@/lib/auth');
      hashedPassword = await hashPassword(password);
    }

    const updatedSiswa = await prisma.siswa.update({
      where: { id },
      data: {
        ...(nama_lengkap !== undefined && { nama_lengkap }),
        ...(email !== undefined && { email }),
        ...(password !== undefined && { password: hashedPassword }),
        ...(jenjang !== undefined && { jenjang }),
        ...(kelas_sekolah !== undefined && { kelas_sekolah }),
        ...(studentType !== undefined && { studentType }),
        ...(profileImage !== undefined && { profileImage }),
        ...(role !== undefined && { role }),
      },
    });

    res.status(200).json(updatedSiswa);
  } catch (error: any) {
    res.status(500).json({
      message: 'Gagal memperbarui profil siswa.',
      error: error.message,
    });
  }
};

export const deleteSiswa = async (req: Request, res: Response) => {
  try {
    const payload = await deleteStudentService(req.params.id as string);

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus siswa.', error });
  }
};

export const deactivateSiswa = async (req: Request, res: Response) => {
  try {
    const payload = await deactivateStudentService(req.params.id as string);
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menonaktifkan siswa.', error });
  }
};

export const activateSiswa = async (req: Request, res: Response) => {
  try {
    const payload = await activateStudentService(req.params.id as string);
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengaktifkan siswa.', error });
  }
};
