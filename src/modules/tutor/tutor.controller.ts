import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { TutorService } from './tutor.service';
import { createTutorSchema } from './tutor.validator';
import { generateToken, UserTokenPayload } from '../../lib/auth';

const tutorService = new TutorService();

export const registerTutor = async (req: Request, res: Response) => {
  try {
    const validatedData = createTutorSchema.parse(req.body);
    const result = await tutorService.register(validatedData);

    const { password: _, ...safeUser } = result;

    return res.status(201).json({
      message: 'Tutor berhasil didaftarkan.',
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

export const googleAuth = passport.authenticate('tutor-google', { scope: ['profile', 'email'] });

export const googleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('tutor-google', { session: false }, (err: any, user: any, info: any) => {
    if (err || !user) {
      console.error(`[AUTH-ERROR] Gagal login Google Tutor:`, err || info);
      return res.redirect(`${process.env.FRONTEND_APP_URL}/login?error=oauth_failed`);
    }

    const tokenPayload: UserTokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'tutor',
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

    console.log(`[AUTH] Tutor login Google tersukses: ${user.email}`);
    res.redirect(`${process.env.FRONTEND_APP_URL}/tutor/dashboard`);
  })(req, res, next);
};
