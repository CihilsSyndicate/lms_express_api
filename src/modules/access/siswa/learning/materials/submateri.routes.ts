import Router from 'express';
import { verifyToken } from '@/lib/auth';

const submateriRouter = Router();

submateriRouter.get('/materi/:materiId', verifyToken, (req, res) => {
  res.status(410).json({ message: 'Submateri has been removed. Use Materi API instead.' });
});
submateriRouter.get('/:id', verifyToken, (req, res) => {
  res.status(410).json({ message: 'Submateri has been removed. Use Materi API instead.' });
});
submateriRouter.post('/', verifyToken, (req, res) => {
  res.status(410).json({ message: 'Submateri has been removed. Use Materi API instead.' });
});
submateriRouter.put('/:id', verifyToken, (req, res) => {
  res.status(410).json({ message: 'Submateri has been removed. Use Materi API instead.' });
});
submateriRouter.delete('/:id', verifyToken, (req, res) => {
  res.status(410).json({ message: 'Submateri has been removed. Use Materi API instead.' });
});

export default submateriRouter;
