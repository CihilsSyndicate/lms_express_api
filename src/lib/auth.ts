import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { genSalt, hash, compare } from 'bcrypt-ts';

export interface UserTokenPayload {
  id: string;
  name: string;
  email: string;
  role: 'siswa' | 'tutor';
}

declare global {
  namespace Express {
    interface User extends UserTokenPayload { }
  }
}

export const generateToken = (user: UserTokenPayload) => {
  const secretKey = process.env.JWT_SECRET as string || 'default_secret';
  const accessToken = jwt.sign({ user }, secretKey, {
    expiresIn: 1 * 24 * 60 * 60,
  }); // 1 day
  const refreshToken = jwt.sign({ user }, secretKey, {
    expiresIn: 7 * 24 * 60 * 60,
  }); // 7 days
  return { accessToken, refreshToken };
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const secretKey = process.env.JWT_SECRET as string;
    // Read token from req.cookies.token instead of headers
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: 'Akses ditolak, Anda tidak Terotorisasi.',
      });
    }

    const decoded = jwt.verify(token, secretKey) as {
      user: UserTokenPayload;
    };

    req.user = decoded.user;
    next();
  } catch (err: unknown) {
    console.log(err);
    return res.status(401).json({ message: 'Invalid token or token expired' });
  }
};

export const requireRole = (role: 'siswa' | 'tutor') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Akses ditolak, butuh autentikasi.' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: `Akses ditolak, otorisasi khusus ${role}.` });
    }
    next();
  };
};

export const hashPassword = async (password: string) => {
  const salt = await genSalt(10);
  return hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  return compare(password, hashedPassword);
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }
    const { accessToken } = generateToken(user);

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    console.error('Refresh Token failed:', error);
    return res.status(500).json({ message: 'Failed to refresh token' });
  }
};
