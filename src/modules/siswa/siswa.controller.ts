import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { SiswaService } from './siswa.service';
import { createSiswaSchema } from './siswa.validator';
import { generateToken, UserTokenPayload } from '../../lib/auth';

const siswaService = new SiswaService();

export const registerSiswa = async (req: Request, res: Response) => {
  try {
    const validatedData = createSiswaSchema.parse(req.body);
    const result = await siswaService.register(validatedData);
    
    const { password: _, ...safeUser } = result;

    return res.status(201).json({
      message: 'Siswa berhasil didaftarkan.',
      user: safeUser,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res
        .status(400)
        .json({ message: 'Validasi gagal.', errors: error.errors });
    }
    return res.status(400).json({ message: error.message });
  }
};

export const googleAuth = passport.authenticate('siswa-google', { scope: ['profile', 'email'] });

export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('siswa-google', { session: false }, (err: any, user: any, info: any) => {
    if (err || !user) {
      console.error(`[AUTH-ERROR] Gagal login Google Siswa:`, err || info);
      return res.redirect(`${process.env.FRONTEND_APP_URL}/login?error=oauth_failed`);
    }

    const tokenPayload: UserTokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'siswa',
    };

    const tokenInfo = generateToken(tokenPayload);

    res.cookie('token', tokenInfo.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('refreshToken', tokenInfo.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log(`[AUTH] Siswa login Google tersukses: ${user.email}`);
    res.redirect(process.env.FRONTEND_APP_URL as string);
  })(req, res, next);
};
