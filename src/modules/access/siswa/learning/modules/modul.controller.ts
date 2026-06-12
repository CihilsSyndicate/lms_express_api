import { Request, Response } from 'express';
import { getModules, getModuleById } from '@/utils/modul';
import { parsePaginationQuery } from '@/utils/pagination';

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
    if (!module || module.isDraft) return res.status(404).json({ message: 'Module not found' });
    return res.status(200).json(module);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
