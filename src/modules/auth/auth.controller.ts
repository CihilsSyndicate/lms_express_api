import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import jwt from 'jsonwebtoken';
import { UserTokenPayload, generateToken } from '../../lib/auth';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email dan password wajib diisi.' });
    }

    const result = await authService.login(email, password);
    if (!result) {
      return res.status(401).json({ message: 'Email atau password salah.' });
    }

    const { user, role, tokens } = result;

    res.cookie('token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 Day
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    });

    return res.status(200).json({
      message: 'Login berhasil.',
      user,
      role,
    });
  } catch (error) {
    console.error('[AUTH-CONTROLLER] Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Logout berhasil.' });
};

export const me = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const user = await authService.getCurrentUser(req.user.id, req.user.role);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    return res.status(200).json({
      message: 'Berhasil mengambil data user.',
      user,
    });
  } catch (error) {
    console.error('[AUTH-CONTROLLER] Get Me error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const rToken = req.cookies?.refreshToken;
    if (!rToken) {
      return res.status(401).json({ message: 'Refresh token tidak ditemukan.' });
    }

    const secretKey = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(rToken, secretKey) as { user: UserTokenPayload };
    
    const { accessToken } = generateToken(decoded.user);

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: 'Token berhasil diperbarui.' });
  } catch (error) {
    console.error('[AUTH-CONTROLLER] Refresh Token error:', error);
    return res.status(401).json({ message: 'Refresh token tidak valid atau kadaluarsa.' });
  }
};
