import Router from 'express';

import authSiswa from './auth/siswa';
import authTutor from './auth/tutor';

const authRouter = Router();
authRouter.use('/siswa', authSiswa);
authRouter.use('/tutor', authTutor);


authRouter.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout berhasil.' });
});


export default authRouter;
