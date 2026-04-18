import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from "passport-google-oauth2"
import { prisma } from './prisma';
import { comparePassword } from './auth';

passport.use(
  'siswa-local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const siswa = await prisma.siswa.findUnique({ where: { email } });

        if (!siswa) {
          return done(null, false, { message: 'Email Siswa tidak ditemukan.' });
        }

        const isMatch = await comparePassword(password, siswa.password);
        if (!isMatch) {
          return done(null, false, { message: 'Password salah.' });
        }

        return done(null, {
          id: siswa.id,
          name: siswa.nama_lengkap,
          email: siswa.email,
          role: 'siswa'
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Strategi Local untuk Tutor
passport.use(
  'tutor-local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const tutor = await prisma.tutor.findUnique({ where: { email } });

        if (!tutor) {
          return done(null, false, { message: 'Email Tutor tidak ditemukan.' });
        }

        const isMatch = await comparePassword(password, tutor.password);
        if (!isMatch) {
          return done(null, false, { message: 'Password salah.' });
        }

        return done(null, {
          id: tutor.id,
          name: tutor.nama_lengkap,
          email: tutor.email,
          role: 'tutor'
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use('siswa-google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  callbackURL: "http://localhost:3000/auth/siswa/google/callback",
  passReqToCallback: true
},
  async function (request: any, accessToken: string, refreshToken: string, profile: any, done: any) {
    try {

      const siswa = await prisma.siswa.upsert({
        where: { googleId: profile.id as string },
        update: {
          googleId: profile.id as string,
        },
        create: {
          googleId: profile.id as string,
          nama_lengkap: profile.displayName as string,
          email: profile.emails[0].value as string,
          profile_img: profile.photos[0].value as string,
          password: "",
          jenjang: "",
          kelas_sekolah: "",
        }
      })

      return done(null, {
        id: siswa.id,
        name: siswa.nama_lengkap,
        email: siswa.email,
        role: 'siswa'
      })

    } catch (err) {
      return done(err);
    }
  }
));

passport.use('tutor-google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  callbackURL: "http://localhost:3000/auth/tutor/google/callback",
  passReqToCallback: true
},
  async function (request: any, accessToken: string, refreshToken: string, profile: any, done: any) {
    try {

      const tutor = await prisma.tutor.upsert({
        where: { googleId: profile.id as string },
        update: {
          googleId: profile.id as string,
        },
        create: {
          googleId: profile.id as string,
          nama_lengkap: profile.displayName as string,
          email: profile.emails[0].value as string,
          profile_img: profile.photos[0].value as string,
          password: "",
          gender: "",
          pekerjaan: "",
          no_whatsapp: "",
          pendidikan_terakhir: "",
          nama_instansi: "",
          prodi: "",
          cv_path_url: ""

        }
      })

      return done(null, {
        id: tutor.id,
        name: tutor.nama_lengkap,
        email: tutor.email,
        role: 'tutor'
      })

    } catch (err) {
      return done(err);
    }
  }
));



export default passport;
