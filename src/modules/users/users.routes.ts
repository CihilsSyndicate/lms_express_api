import Router from 'express';
import { verifyToken } from '@/lib/auth';
import { getUserById } from '@/utils/user';
import { authenticateUser, authorizeRole } from '@/middleware/auth';
import { getAllUsers } from '@/controllers/user';

const userRouter = Router();

userRouter.get(
  '/',
  authenticateUser,
  authorizeRole('siswa', 'tutor', 'admin') as any,
  getAllUsers,
);

userRouter.get('/me', verifyToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  const user = await getUserById(req.user.id, req.user.role);

  return res.status(200).json({
    message: 'Berhasil mengambil data user',
    data: user,
  });
});

export default userRouter;
