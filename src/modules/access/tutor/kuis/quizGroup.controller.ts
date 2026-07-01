import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { createQuizGroupSchema, updateQuizGroupSchema } from '@/validators/kuis/quizGroup.validator';
import {
  createQuizGroupRecord,
  updateQuizGroupRecord,
  deleteQuizGroup,
  getQuizGroupById,
  getQuizGroupsByTopik,
} from '@/utils/kuis';

export const createQuizGroup = async (req: Request, res: Response) => {
  try {
    const parsed = createQuizGroupSchema.parse(req.body);
    const newGroup = await createQuizGroupRecord(parsed);
    res.status(201).json(newGroup);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues,
      });
    }
    console.error('Error creating quiz group:', error);
    res.status(500).json({ error: 'Failed to create quiz group' });
  }
};

export const updateQuizGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = updateQuizGroupSchema.parse(req.body);
    const updated = await updateQuizGroupRecord(id as string, parsed as any);
    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues,
      });
    }
    console.error('Error updating quiz group:', error);
    res.status(500).json({ error: 'Failed to update quiz group' });
  }
};

export const removeQuizGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteQuizGroup(id as string);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting quiz group:', error);
    res.status(500).json({ error: 'Failed to delete quiz group' });
  }
};

export const getQuizGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const group = await getQuizGroupById(id as string);
    if (!group) {
      return res.status(404).json({ error: 'Quiz group not found' });
    }
    res.status(200).json(group);
  } catch (error) {
    console.error('Error fetching quiz group:', error);
    res.status(500).json({ error: 'Failed to fetch quiz group' });
  }
};

export const listQuizGroupsByTopik = async (req: Request, res: Response) => {
  try {
    const { topikId } = req.params;
    const groups = await getQuizGroupsByTopik(topikId as string);
    res.status(200).json(groups);
  } catch (error) {
    console.error('Error fetching quiz groups:', error);
    res.status(500).json({ error: 'Failed to fetch quiz groups' });
  }
};
