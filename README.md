# LMS Express API

## Deskripsi
LMS Express API adalah platform backend berbasis Node.js yang dirancang untuk mendukung sistem manajemen pembelajaran (Learning Management System). API ini memiliki fitur unik berupa implementasi **Bayesian Knowledge Tracing (BKT)** untuk melacak tingkat penguasaan materi siswa secara adaptif. Proyek ini dibangun dengan fokus pada modularitas, skalabilitas, dan keamanan menggunakan arsitektur berbasis fitur (**Feature-Based Modular Architecture**).

## Fitur Utama
- **Unified Authentication**: Satu pintu login untuk Siswa dan Tutor menggunakan JWT & Http-Only Cookies.
- **Role-Based Access Control (RBAC)**: Diferensiasi akses antara Siswa dan Tutor.
- **Adaptive Learning (BKT)**: Algoritma cerdas untuk menentukan tingkat penguasaan (mastery) siswa berdasarkan hasil pretest dan log jawaban.
- **Content Management**: Pengelolaan Modul, Materi, Submateri, dan Topik secara hierarkis.
- **Assessment System**: Fitur Pretest dan Posttest dengan validasi otomatis.
- **Progress Tracking**: Pelacakan kemajuan belajar siswa hingga tingkat submateri.
- **Digital Certificates**: Penerbitan sertifikat otomatis bagi siswa yang lulus modul.
- **API Documentation**: Dokumentasi interaktif menggunakan Swagger/OpenAPI.

## Tech Stack
- **Framework**: Express.js (TypeScript)
- **ORM**: Prisma (PostgreSQL)
- **Validation**: Zod
- **Authentication**: JWT, Passport.js, Google OAuth 2.0
- **Security**: Bcrypt-ts (Password Hashing), Cookie-parser
- **Documentation**: Swagger UI Express

## Struktur Proyek (Modular)
Proyek ini menggunakan **Feature-Based Modular Architecture** untuk memastikan setiap domain kode terisolasi dan mudah dikelola:

```text
src/
├── modules/           # Arsitektur berbasis fitur
│   ├── auth/          # Login unified, logout, refresh token
│   ├── bkt/           # Logic adaptif Bayesian Knowledge Tracing
│   ├── certificate/   # Pengelolaan sertifikat digital
│   ├── modul/         # Pengelolaan konten modul & aturan unlock
│   ├── progress/      # Pelacakan skor dan completion rate
│   ├── siswa/         # Registrasi & profile khusus siswa
│   ├── tutor/         # Registrasi & profile khusus tutor
│   └── ...            # (materi, submateri, topik, pre/posttest)
├── lib/               # Shared libraries (Prisma client, Auth middleware)
├── utils/             # Helper functions & utilities
├── routes/            # Centralized route aggregator (index.ts)
└── index.ts           # Entry point aplikasi
```

## Instalasi & Setup

### 1. Clone Repository
```bash
git clone https://github.com/username/lms-express-api.git
cd lms-express-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment
Buat file `.env` di root direktori dan sesuaikan dengan `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lms_db"
JWT_SECRET="your_secret_key"
FRONTEND_APP_URL="http://localhost:3000"
API_PORT=3000
```

### 4. Setup Database & Prisma
```bash
npx prisma generate
npx prisma db push # Atau: npx prisma migrate dev
npm run seed       # Mengisi data awal (jika ada)
```

### 5. Jalankan Server
```bash
npm run dev
```

## API Endpoints Utama

| Fitur | Method | Endpoint | Akses |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/auth/login` | Publik |
| | GET | `/auth/me` | User Login |
| **Siswa** | POST | `/siswa/register` | Publik |
| | GET | `/siswa/google` | OAuth |
| **Tutor** | POST | `/tutor/register` | Publik |
| **Modul** | GET | `/modul` | Publik |
| | POST | `/modul` | Tutor |
| **Progress**| GET | `/progress/:modulId` | Siswa |

> Dokumentasi lengkap dapat diakses melalui: `http://localhost:3000/api-docs`

## Alur Autentikasi
1. User melakukan **Login** melalui `/auth/login`.
2. Server mengirimkan `accessToken` dan `refreshToken` melalui **HTTP-Only Cookies**.
3. Untuk akses route terproteksi, middleware `verifyToken` akan secara otomatis mengecek cookie tersebut.
4. User bisa melakukan **Refresh Token** tanpa harus login ulang selama refresh token masih valid.

## Database Design
Aplikasi ini memiliki relasi database yang kompleks untuk mendukung BKT:
- **Tutor** memiliki banyak **Modul**.
- **Modul** memiliki banyak **Materi**, **Topik**, **Pretest**, dan **Posttest**.
- **Siswa** memiliki relasi **Progress** ke **Modul**.
- **KnowledgeComponent** memetakan skill ke soal-soal pretest untuk perhitungan BKT.

## Deployment
Aplikasi ini siap dideploy ke **Vercel**:
1. Pastikan `vercel.json` sudah terkonfigurasi.
2. Hubungkan repository ke dashboard Vercel.
3. Tambahkan Environment Variables di dashboard Vercel.

## Lisensi
Proyek ini dilisensikan di bawah **MIT License**.

## Pengembang
- **Senior Backend Team**
- Kontak: support@lms-example.com
