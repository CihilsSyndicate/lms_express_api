import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { comparePassword, generateToken } from '../../lib/auth';
import type { UserTokenPayload } from '../../lib/auth';

const loginRouter = Router();

/**
 * POST /auth/login
 *
 * Single-gate login: checks Siswa table first, then Tutor.
 * Returns JWT via HTTP-only cookie + user info in body.
 */
loginRouter.post('/', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email dan password wajib diisi.' });
    }

    try {
        let foundUser: any = null;
        let role: 'siswa' | 'tutor' = 'siswa';

        const siswa = await prisma.siswa.findUnique({ where: { email } });

        if (siswa) {
            const isMatch = await comparePassword(password, siswa.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email atau password salah.' });
            }
            foundUser = siswa;
            role = 'siswa';
        } else {
            const tutor = await prisma.tutor.findUnique({ where: { email } });

            if (!tutor) {
                return res.status(401).json({ message: 'Email atau password salah.' });
            }

            const isMatch = await comparePassword(password, tutor.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Email atau password salah.' });
            }

            foundUser = tutor;
            role = 'tutor';
        }

        const tokenPayload: UserTokenPayload = {
            id: foundUser.id,
            name: foundUser.nama_lengkap,
            email: foundUser.email,
            role,
        };

        const { accessToken, refreshToken } = generateToken(tokenPayload);

        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 Hari
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Hari
        });

        console.log(`[AUTH] Login berhasil: ${email} (role: ${role})`);

        // Kembalikan data user tanpa password
        const { password: _, ...safeUser } = foundUser;

        return res.status(200).json({
            message: 'Login berhasil.',
            role,
            user: { ...safeUser, role },
        });

    } catch (error) {
        console.error('[AUTH-ERROR] Unified login error:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

export default loginRouter;
