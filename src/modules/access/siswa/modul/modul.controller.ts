import { Request, Response } from 'express';
import { getModules, getModuleById } from '@/utils/modul';
import {
  parsePaginationQuery,
  buildCursorWhere,
  decodeCursor,
  buildCursorPaginatedResponse,
} from '@/utils/pagination';
import { prisma } from '@/lib/prisma';
import { pushNotification, triggerAdminEvent } from '@/utils/realtime';

export const getModulesController = async (req: Request, res: Response) => {
  try {
    const { limit, cursor } = parsePaginationQuery(req.query);
    const modules = await getModules(limit, cursor);
    return res.status(200).json(modules);
  } catch (error: any) {
    if (
      error.message === 'Invalid limit parameter' ||
      error.message === 'Invalid cursor'
    ) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getModuleByIdController = async (req: Request, res: Response) => {
  try {
    const module = await getModuleById(req.params.id as string);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    return res.status(200).json(module);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const enrollModuleController = async (req: Request, res: Response) => {
  try {
    const siswaId = req.user?.id;
    const modulId = req.params.id;

    if (!siswaId) return res.status(401).json({ message: 'Unauthorized' });

    const module = await getModuleById(modulId as string);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    if (module.isDraft)
      return res.status(400).json({ message: 'Cannot enroll in draft module' });

    // Check pricing
    if (module.isPaid) {
      // Mock check for payment (currently we just reject if it's paid without a payment flow)
      return res
        .status(403)
        .json({ message: 'Cannot enroll in a paid module without purchase' });
    }

    // Assign / Initialize Progress
    const existing = await prisma.progress.findUnique({
      where: { siswaId_modulId: { siswaId, modulId: modulId as string } },
    });

    if (existing) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    await prisma.progress.create({
      data: {
        siswaId,
        modulId: modulId as string,
        progressPercentage: 0,
      },
    });

    // await pushNotification(
    //   siswaId,
    //   'enrollment',
    //   'Pendaftaran Modul',
    //   `Anda berhasil mendaftar modul "${module.moduleName}".`,
    // );
    // triggerAdminEvent('admin.enrollment', {
    //   userId: siswaId,
    //   moduleName: module.moduleName,
    //   action: 'self-enroll',
    // });

    return res.status(200).json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error('[ENROLL-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getEnrolledModulesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const siswaId = req.user?.id;
    if (!siswaId) return res.status(401).json({ message: 'Unauthorized' });

    const { limit, cursor } = parsePaginationQuery(req.query);

    const cursorPayload = cursor ? decodeCursor(cursor) : undefined;
    const cursorWhere = buildCursorWhere(cursorPayload);

    const enrolled = await prisma.progress.findMany({
      where: { AND: [{ siswaId }, cursorWhere] },
      take: limit + 1,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: {
        modul: {
          include: {
            tutor: { select: { fullName: true } },
          },
        },
      },
    });

    const items = enrolled.map((p) => ({
      ...p.modul,
      progress: {
        id: p.id,
        progressPercentage: p.progressPercentage,
        status: p.status,
        isGraduated: p.isGraduated,
        pretestScore: p.pretestScore,
        posttestScore: p.posttestScore,
        finalScore: p.finalScore,
        lastAccessed: p.lastAccessed,
      },
    }));

    return res.status(200).json(
      buildCursorPaginatedResponse(items, limit, (item) => ({
        createdAt: item.createdAt,
        id: item.id,
      })),
    );
  } catch (error) {
    console.error('[ENROLLED-MODULES-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
