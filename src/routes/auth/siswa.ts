import Router from 'express';
import passport from 'passport';
import { generateToken, hashPassword } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import type { UserTokenPayload } from '../../lib/auth';

const authSiswa = Router();

authSiswa.post('/register', async (req, res) => {
    try {
        const { nama_lengkap, email, password, jenjang, kelas_sekolah } = req.body;

        console.log(`[AUTH] Percobaan mendaftar akun Siswa baru dengan email: ${email}`);

        const existingSiswa = await prisma.siswa.findUnique({ where: { email } });
        if (existingSiswa) {
            return res.status(400).json({ message: 'Email sudah terdaftar (Siswa).' });
        }

        const hashedPassword = await hashPassword(password);

        const siswa = await prisma.siswa.create({
            data: {
                nama_lengkap,
                email,
                password: hashedPassword,
                jenjang,
                kelas_sekolah,
            },
        });

        console.log(`[AUTH] Siswa berhasil diregistrasi: ID ${siswa.id}`);
        res.status(201).json({ message: 'Siswa berhasil didaftarkan.', id: siswa.id });
    } catch (error) {
        console.error(`[AUTH-ERROR] Gagal register Siswa:`, error);
        res.status(500).json({ message: 'Internal server error saat pendaftaran Siswa.' });
    }
});

authSiswa.post('/login', async (req, res, next) => {
    console.log(`[AUTH] Mencoba login Siswa...`);
    passport.authenticate('siswa-local', { session: false }, (err: any, user: any, info: any) => {
        if (err) {
            console.error(`[AUTH-ERROR] Error pada strategi login Siswa:`, err);
            return res.status(500).json({ message: 'Internal server error saat login.' });
        }
        if (!user) {
            return res.status(401).json({ message: info?.message || 'Email atau password salah.' });
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
            maxAge: 24 * 60 * 60 * 1000, // 1 Hari
        });

        res.cookie('refreshToken', tokenInfo.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Hari
        });

        console.log(`[AUTH] Siswa login tersukses: ${user.email}`);
        res.status(200).json({ message: 'Login Siswa berhasil.', user });
    })(req, res, next);
});

authSiswa.get('/google', passport.authenticate('siswa-google', { scope: ['profile', 'email'] }));

authSiswa.get('/google/callback', (req, res, next) => {
    passport.authenticate('siswa-google', { session: false }, (err: any, user: any, info: any) => {
        if (err || !user) {
            console.error(`[AUTH-ERROR] Gagal login Google:`, err || info);
            return res.redirect(`${process.env.API_APP_URL}/login?error=oauth_failed`);
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
});



export default authSiswa;