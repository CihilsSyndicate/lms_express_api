import Router from 'express';

const submateriRouter = Router();

submateriRouter.get('/materi/:materiId', (req, res) => {
  res.status(410).json({ message: 'Submateri has been removed. Use Materi API instead.' });
});
submateriRouter.get('/:id', (req, res) => {
  res.status(410).json({ message: 'Submateri has been removed. Use Materi API instead.' });
});

export default submateriRouter;
