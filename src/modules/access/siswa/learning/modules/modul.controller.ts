import { Request, Response } from 'express';
import { 
  getModules, 
  getModuleById 
} from '@/utils/modul';

export const getModulesController = async (req: Request, res: Response) => {
  try {
    const modules = await getModules();
    return res.status(200).json({ data: modules });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getModuleByIdController = async (req: Request, res: Response) => {
  try {
    const module = await getModuleById(req.params.id as string);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    return res.status(200).json({ data: module });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
