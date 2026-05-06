import Router from 'express';
import { ratingModul } from './rating.controller';

export const ratingRouter = Router();

ratingRouter.post('/:id', async (req, res) => {
  try {
    await ratingModul(req, res);
  } catch (err) {
    console.error('[MODUL-ERROR] Gagal memberikan rating:', err);
    res
      .status(500)
      .json({ message: 'Internal server error saat memberikan rating.' });
  }
});
