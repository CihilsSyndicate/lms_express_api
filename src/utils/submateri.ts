import { AppError } from '@/errors/app.error';
import { prisma } from '@/lib/prisma';
import type {
  CreateSubmateriRecord,
  UpdateSubmateriRecord,
} from '@/validators/submateri/submateri.validator';

/**
 * Domain/Business Logic Functions for Submateri (Submaterial)
 * These functions contain business rules, data validation, and orchestration.
 * NOTE: Submateri has been removed. These functions are stubs that throw errors.
 */

export const createSubmateri = async (
  payload: CreateSubmateriRecord,
  tutorId?: string,
) => {
  throw new Error('Submateri has been removed. Use Materi API instead.');
};

export const getSubmateriList = async (materiId: string) => {
  throw new Error('Submateri has been removed. Use Materi API instead.');
};

export const getSubmateriById = async (submateriId: string) => {
  throw new Error('Submateri has been removed. Use Materi API instead.');
};

export const updateSubmateri = async (
  submateriId: string,
  payload: UpdateSubmateriRecord,
  tutorId?: string,
) => {
  throw new Error('Submateri has been removed. Use Materi API instead.');
};

export const deleteSubmateri = async (
  submateriId: string,
  tutorId?: string,
) => {
  throw new Error('Submateri has been removed. Use Materi API instead.');
};
