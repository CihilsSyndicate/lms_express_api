import Router from 'express';
import passport from 'passport';
import { generateToken, hashPassword } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import type { UserTokenPayload } from '../../lib/auth';

const authTutor = Router();

// ==========================================
// AUTENTIKASI TUTOR
// ==========================================

authTutor.post('/register', async (req, res) => {
    try {
        const {
            nama_lengkap,
            email,
            password,
            gender,
            pekerjaan,
            no_whatsapp,
            pendidikan_terakhir,
            nama_instansi,
            prodi,
            cv_path_url
        } = req.body;

        console.log(`[AUTH] Percobaan mendaftar akun Tutor baru dengan email: ${email}`);

        const existingTutor = await prisma.tutor.findUnique({ where: { email } });
        if (existingTutor) {
            return res.status(400).json({ message: 'Email sudah terdaftar (Tutor).' });
        }

        const hashedPassword = await hashPassword(password);

        const tutor = await prisma.tutor.create({
            data: {
                nama_lengkap,
                email,
                password: hashedPassword,
                gender,
                pekerjaan,
                no_whatsapp,
                pendidikan_terakhir,
                nama_instansi,
                prodi,
                cv_path_url
            },
        });

        console.log(`[AUTH] Tutor berhasil diregistrasi: ID ${tutor.id}`);
        res.status(201).json({ message: 'Tutor berhasil didaftarkan.', id: tutor.id });
    } catch (error) {
        console.error(`[AUTH-ERROR] Gagal register Tutor:`, error);
        res.status(500).json({ message: 'Internal server error saat pendaftaran Tutor.' });
    }
});

authTutor.post('/login', async (req, res, next) => {
    console.log(`[AUTH] Mencoba login Tutor...`);
    passport.authenticate('tutor-local', { session: false }, (err: any, user: any, info: any) => {
        if (err) {
            console.error(`[AUTH-ERROR] Error pada strategi login Tutor:`, err);
            return res.status(500).json({ message: 'Internal server error saat login.' });
        }
        if (!user) {
            return res.status(401).json({ message: info?.message || 'Email atau password salah.' });
        }

        const tokenPayload: UserTokenPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'tutor',
        };

        const tokenInfo = generateToken(tokenPayload);

        // Kirim jwt lewat cookie dengan properti httpOnly
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

        console.log(`[AUTH] Tutor login tersukses: ${user.email}`);
        res.status(200).json({ message: 'Login Tutor berhasil.', role: 'tutor' });
    })(req, res, next);
});

// --- 1. Redirect ke Google
authTutor.get('/google', passport.authenticate('tutor-google', { scope: ['profile', 'email'] }));

// --- 2. Callback pasca login dari Google
authTutor.get('/google/callback', (req, res, next) => {
    passport.authenticate('tutor-google', { session: false }, (err: any, user: any, info: any) => {
        if (err || !user) {
            console.error(`[AUTH-ERROR] Gagal login Google:`, err || info);
            return res.redirect(`${process.env.API_APP_URL}/login?error=oauth_failed`);
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
        // Redirect ke dashboard frontend
        // res.redirect(`${process.env.FRONTEND_APP_URL}/tutor/dashboard`);
    })(req, res, next);
});

export default authTutor;