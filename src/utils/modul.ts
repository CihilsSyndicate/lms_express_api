import type {
  CreateModulRecord,
  UpdateModulRecord,
  Modul,
} from '@/validators/modul/modul.validator';
import { prisma } from '@/lib/prisma';
import {
  buildCursorPaginatedResponse,
  buildCursorWhere,
  decodeCursor,
} from './pagination';

export const createModule = async (payload: Record<string, unknown>) => {
  try {
    const modulType = (payload.modulType ?? payload.type ?? 'SISWA') as
      | 'SISWA'
      | 'UMUM';
    const newModule = await prisma.modul.create({
      data: {
        moduleName: String(payload.moduleName ?? ''),
        subtitle: String(payload.subtitle ?? ''),
        description: String(payload.description ?? ''),
        targetTime: Number(payload.targetTime ?? 60),
        difficulty: String(payload.difficulty ?? 'Menengah'),
        isPaid: Boolean(payload.isPaid ?? false),
        modulPrice: Number(payload.modulPrice ?? 0),
        level:
          modulType === 'UMUM'
            ? null
            : ((payload.level as string | null) ?? null),
        class:
          modulType === 'UMUM'
            ? null
            : ((payload.class as string | null) ?? null),
        modulType,
        isDraft: Boolean(payload.isDraft ?? true),
        moduleImgUrl: (payload.moduleImgUrl as string | null) ?? null,
        pretestPostTestEnabled: Boolean(payload.pretestPostTestEnabled ?? true),
        hasStudyGroup: Boolean(payload.hasStudyGroup ?? false),
        hasCertificate: Boolean(payload.hasCertificate ?? false),
        tutorId: String(payload.tutorId ?? ''),
      },
    });

    return newModule;
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
};

export const getTutorModules = async (
  tutorId: string,
  limit: number = 10,
  cursor?: string,
) => {
  try {
    const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
    const where = buildCursorWhere(cursorPayload);
    const modules = await prisma.modul.findMany({
      where: {
        ...where,
        tutorId,
      },
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return buildCursorPaginatedResponse(modules, limit, (item) => ({
      createdAt: item.createdAt,
      id: item.id,
    }));
  } catch (error) {
    console.error('Error fetching tutor modules:', error);
    throw error;
  }
};

export const getModules = async (
  limit: number = 10,
  cursor?: string,
  modulType?: 'SISWA' | 'UMUM',
  level?: string,
  kelas?: string,
) => {
  try {
    const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
    const where = buildCursorWhere(cursorPayload);

    if (modulType) {
      (where as any).modulType = modulType;
    }
    if (modulType === 'SISWA' && level) {
      (where as any).level = level;
    }
    if (modulType === 'SISWA' && kelas) {
      (where as any).class = kelas;
    }
    (where as any).isDraft = false;

    const modules = await prisma.modul.findMany({
      where,
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        tutor: { select: { fullName: true } },
        progress: {
          select: { siswaId: true },
        },
      },
    });

    const items = modules.map((modul) => ({
      ...modul,
      totalSiswa: modul.progress.length,
    }));

    return buildCursorPaginatedResponse(items, limit, (item) => ({
      createdAt: item.createdAt,
      id: item.id,
    }));
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
};

export const getModuleById = async (id: string, siswaId?: string) => {
  try {
    const findModuleById = await prisma.modul.findUnique({
      where: { id },
      include: {
        tutor: { select: { fullName: true, profileImg: true } },
        pretest: true,
        posttest: true,
        topiks: {
          include: {
            materis: true,
            quizzes: {
              include: {
                quizAnswerOptions: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] },
                quizSettings: true,
              },
              orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
            },
            topikItems: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        computationalThinkings: true,
      },
    });
    if (!findModuleById) return null;

    // console.log(findModuleById);

    let progress = null;
    if (siswaId) {
      progress = await prisma.progress.findUnique({
        where: { siswaId_modulId: { siswaId, modulId: id } },
      });
    }

    return { ...findModuleById, progress };
  } catch (error) {
    console.error('Error fetching module by ID:', error);
    throw error;
  }
};

export const updateModule = async (
  payload: UpdateModulRecord,
  id: string,
  tutorId?: string,
) => {
  try {
    const existingModule = await getModuleById(id);

    if (!existingModule) {
      throw new Error('Module not found');
    }
    if (tutorId && existingModule.tutorId !== tutorId) {
      throw new Error('Unauthorized to update this module');
    }

    if (payload?.isPaid && Number(payload?.modulPrice) < 1) {
      throw new Error(
        'Module price must be a positive number if the module is paid',
      );
    }
    const newModulType = payload.modulType ?? existingModule.modulType;
    const updatedModule = await prisma.modul.update({
      where: { id },
      data: {
        ...Object.fromEntries(Object.entries(payload).filter(([_, v]) => v !== undefined)),
        modulType: newModulType,
        subtitle: payload.subtitle ?? existingModule.subtitle,
        moduleName: payload.moduleName ?? existingModule.moduleName,
        description: payload.description ?? existingModule.description,
        targetTime: payload.targetTime ?? existingModule.targetTime,
        difficulty: payload.difficulty ?? existingModule.difficulty,
        isPaid: payload.isPaid ?? existingModule.isPaid,
        modulPrice: payload.modulPrice ?? existingModule.modulPrice,
        level:
          newModulType === 'UMUM'
            ? null
            : payload.level !== undefined
              ? payload.level
              : existingModule.level,
        class:
          newModulType === 'UMUM'
            ? null
            : payload.class !== undefined
              ? payload.class
              : existingModule.class,
        pretestId: payload.pretestId ?? existingModule.pretestId,
        posttestId: payload.posttestId ?? existingModule.posttestId,
        autoAccessEnabled: payload.autoAccessEnabled ?? existingModule.autoAccessEnabled,
      },
    });

    return updatedModule;
  } catch (error) {
    console.error('Error updating module:', error);
    throw error;
  }
};

export const deleteModule = async (id: string, tutorId?: string) => {
  try {
    const existingModule = await prisma.modul.findUnique({
      where: { id },
      select: { id: true, tutorId: true },
    });
    if (!existingModule) {
      throw new Error('Module not found');
    }
    if (tutorId && existingModule.tutorId !== tutorId) {
      throw new Error('Unauthorized to delete this module');
    }

    await prisma.modul.delete({
      where: { id },
    });

    return { message: 'Module deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting module:', error);
    if (error?.code === 'P2014' || error?.code === 'P2003') {
      throw new Error(
        'Gagal menghapus: modul masih memiliki data terkait. Hapus data siswa terlebih dahulu.',
      );
    }
    throw error;
  }
};

export const assignStudentToModule = async (
  moduleId: string,
  studentId: string,
) => {
  return prisma.progress.create({
    data: {
      modulId: moduleId,
      siswaId: studentId,
      progressPercentage: 0,
    },
  });
};

export const unassignStudentFromModule = async (
  moduleId: string,
  studentId: string,
) => {
  try {
    const findAssigned = await findAssignedStudents(moduleId, studentId);
    if (findAssigned.length < 1) {
      throw new Error(
        'Student is not assigned to this module or progress not found',
      );
    }

    const deleteCertificates = prisma.certificate.deleteMany({
      where: { modulId: moduleId, siswaId: studentId },
    });

    const deleteRatings = prisma.rating.deleteMany({
      where: { modulId: moduleId, siswaId: studentId },
    });

    const deleteAnswerLogs = prisma.studentAnswerLog.deleteMany({
      where: { modulId: moduleId, siswaId: studentId },
    });

    const deleteKnowledgeStates = prisma.studentKnowledgeState.deleteMany({
      where: { modulId: moduleId, siswaId: studentId },
    });

    const deleteProgress = prisma.progress.deleteMany({
      where: {
        modulId: moduleId,
        siswaId: studentId,
      },
    });

    const [deletedProgress] = await prisma.$transaction([
      deleteProgress,
      deleteCertificates,
      deleteRatings,
      deleteAnswerLogs,
      deleteKnowledgeStates,
    ]);

    return deletedProgress;
  } catch (error) {
    console.error('Error unassigning student from module:', error);
    throw error;
  }
};

export const getModuleStudents = async (
  modulId: string,
  limit: number = 10,
  cursor?: string,
) => {
  try {
    const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
    const cursorWhere = buildCursorWhere(cursorPayload);
    const where = { ...cursorWhere, modulId };

    const progressRecords = await prisma.progress.findMany({
      where,
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        siswa: {
          select: {
            id: true,
            nama_lengkap: true,
            email: true,
            jenjang: true,
            kelas_sekolah: true,
            profileImage: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    const items = progressRecords.map((record) => ({
      id: record.id,
      siswaId: record.siswaId,
      nama_lengkap: record.siswa.nama_lengkap,
      email: record.siswa.email,
      jenjang: record.siswa.jenjang,
      kelas_sekolah: record.siswa.kelas_sekolah,
      profileImage: record.siswa.profileImage,
      isActive: record.siswa.isActive,
      progressPercentage: record.progressPercentage,
      status: record.status,
      isGraduated: record.isGraduated,
      pretestScore: record.pretestScore,
      posttestScore: record.posttestScore,
      finalScore: record.finalScore,
      createdAt: record.createdAt,
    }));

    return buildCursorPaginatedResponse(items, limit, (item) => ({
      createdAt: item.createdAt,
      id: item.id,
    }));
  } catch (error) {
    console.error('Error fetching module students:', error);
    throw error;
  }
};

export const findAssignedStudents = async (
  moduleId: string,
  studentId: string,
) => {
  try {
    const assignedStudents = await prisma.progress.findMany({
      where: {
        modulId: moduleId,
        siswaId: studentId,
      },
      select: { siswaId: true },
    });
    return assignedStudents;
  } catch (error) {
    console.error('Error finding assigned students:', error);
    throw error;
  }
};
