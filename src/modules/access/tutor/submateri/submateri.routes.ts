import { Router } from 'express';

const submateriRouter = Router();

submateriRouter.all('*', (_req, res) => {
  res.status(410).json({ message: 'Submateri has been removed. Use Materi API instead.' });
});

export default submateriRouter;
