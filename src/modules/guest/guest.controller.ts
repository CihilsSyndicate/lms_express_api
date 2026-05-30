import { Request, Response } from 'express';
import { getModules, getModuleById } from '@/utils/modul';
import { prisma } from '@/lib/prisma';

export const searchModules = async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Kata kunci minimal 2 karakter.' });
    }

    const modules = await prisma.modul.findMany({
      where: {
        OR: [
          { moduleName: { contains: q, mode: 'insensitive' } },
          { subtitle: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        tutor: { select: { fullName: true } },
      },
    });

    return res.status(200).json(modules);
  } catch (error) {
    console.error('[SEARCH-MODULES-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getAllModules = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const cursor = req.query.cursor as string | undefined;

    const result = await getModules(limit, cursor);

    return res.status(200).json(result);
  } catch (error) {
    console.error('[GUEST-MODULES-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getModuleByIdHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ message: 'ID module diperlukan.' });
    }

    const module = await getModuleById(id);
    if (!module) {
      return res.status(404).json({ message: 'Module tidak ditemukan.' });
    }

    return res.status(200).json(module);
  } catch (error) {
    console.error('[GUEST-MODULE-BY-ID-ERROR]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
