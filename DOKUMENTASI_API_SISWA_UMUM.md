# Dokumentasi API Role Siswa & Umum

Dokumentasi ini khusus untuk endpoint role `siswa` dan `umum` pada backend LMS Express API.

## 1) Ringkasan Akses

- Base URL lokal: `http://localhost:3000`
- Prefix role:
  - `siswa`: `/siswa/*`
  - `umum`: `/umum/*`
- Semua endpoint di bawah `/siswa` dan `/umum` **wajib login** dan memakai middleware:
  - `verifyToken` (validasi cookie JWT)
  - `requireRole('siswa')` atau `requireRole('umum')`

## 2) Cara Pakai (Auth & Session)

### Login
- Endpoint: `POST /auth/login`
- Body minimal:
```json
{
  "email": "user@mail.com",
  "password": "secret"
}
```
- Jika berhasil, server set cookie:
  - `token` (access token, 1 hari)
  - `refreshToken` (7 hari)

### Refresh token
- Endpoint: `POST /auth/refresh`
- Gunakan saat `token` expired (dengan `refreshToken` cookie masih valid).

### Logout
- Endpoint: `POST /auth/logout`
- Membersihkan cookie `token` dan `refreshToken`.

## 3) Konvensi Umum Endpoint

- Pagination (`GET` list tertentu): gunakan query:
  - `limit` (default 10, max 100)
  - `cursor` (base64 cursor)
- Format respons pagination:
```json
{
  "items": [],
  "next_cursor": "base64-cursor-atau-null"
}
```

---

## 4) Endpoint Role Siswa

Base prefix: `/siswa`

### A. Dashboard

- **GET** `/siswa/dashboard/`
  - Tujuan: ambil payload dashboard siswa.
  - Respons utama:
    - `latestProgress`
    - `certificateData`
    - `accessibleModules`
    - `lastActivity`

### B. Modul

- **GET** `/siswa/modul`
  - Tujuan: list modul (dengan dukungan `limit`, `cursor`).
- **GET** `/siswa/modul/enrolled`
  - Tujuan: list modul yang sudah di-enroll siswa login.
- **GET** `/siswa/modul/:id`
  - Tujuan: detail modul.
- **POST** `/siswa/modul/:id/enroll`
  - Tujuan: enroll ke modul.
  - Catatan validasi:
    - gagal jika modul draft
    - gagal jika modul berbayar (belum ada flow pembayaran)
    - gagal jika sudah pernah enroll

### C1. Study Room (Playlist + Konten Belajar)

- **GET** `/siswa/study-room/:modulId`
  - Tujuan: ambil payload lengkap untuk ruang belajar siswa — kurikulum, progres, dan soal.
  - Auth: `verifyToken` + `requireRole('siswa')`
  - Response:
```json
{
  "modulId": "cmq...",
  "moduleName": "Pemrograman Web Dasar",
  "progress": {
    "completedContentItems": ["pretest", "submateri_abc"],
    "progressPercentage": 43,
    "pretestScore": 85,
    "posttestScore": null
  },
  "curriculum": {
    "pretest": {
      "id": "pretest_cmq",
      "title": "Pre-Test HTML",
      "questions": [
        {
          "id": "q1",
          "text": "Apa itu HTML?",
          "options": [
            { "key": "a", "label": "Hyper Text Markup Language" },
            { "key": "b", "label": "Home Tool Markup Language" }
          ]
        }
      ]
    },
    "topiks": [
      {
        "id": "topik_cmq",
        "nama": "HTML Dasar",
        "items": [
          {
            "itemId": "submateri_1",
            "itemType": "SUBMATERI",
            "title": "Pengantar HTML",
            "content": "<p>Konten submateri...</p>",
            "hasVideo": false,
            "videoUrl": null
          },
          {
            "itemId": "quiz_cmq",
            "itemType": "QUIZ",
            "title": "Quiz HTML Dasar",
            "content": null,
            "hasVideo": false,
            "videoUrl": null
          },
          {
            "itemId": "rangkuman_topik_cmq",
            "itemType": "RANGKUMAN_TOPIK",
            "title": "Rangkuman HTML Dasar",
            "content": "Teks rangkuman yang ditulis manual oleh Tutor..."
          }
        ]
      }
    ],
    "rangkumanAkhir": {
      "itemId": "rangkuman_akhir",
      "title": "Rangkuman Akhir",
      "content": "Teks rangkuman akhir manual oleh Tutor..."
    },
    "posttest": {
      "id": "posttest_cmq",
      "title": "Post-Test",
      "questions": [
        {
          "id": "q99",
          "text": "Jelaskan DOM",
          "options": [
            { "key": "a", "label": "Document Object Model" },
            { "key": "b", "label": "Data Object Model" }
          ]
        }
      ]
    }
  }
}
```
  - Catatan:
    - `RANGKUMAN_TOPIK` di-injeksi otomatis sebagai **item terakhir** di tiap topik (isi dari `Topik.rangkumanTopik`).
    - `rangkumanAkhir` di-injeksi dari `Modul.rangkumanAkhir`.
    - Soal pretest/posttest **tidak** menyertakan `correctAnswer` (endpoint sisi siswa).
    - `items` diurutkan berdasarkan `TopikItem.orderNumber`.

### C2. Progress

- **GET** `/siswa/progress`
  - Tujuan: list progress semua modul siswa.
  - Mendukung pagination cursor.
- **GET** `/siswa/progress/:modulId`
  - Tujuan: detail progress 1 modul.
  - Menyertakan `completionRate` hasil hitung submateri selesai.
- **POST** `/siswa/progress/submateri/:submateriId/complete`
  - Tujuan: tandai submateri selesai.
  - Efek:
    - upsert `progressDetail`
    - sinkronisasi ringkasan progress modul
    - kirim notifikasi progress

### D. Topik

- **GET** `/siswa/topik/:modulId`
  - Tujuan: list topik dalam modul.

### E. Materi

- **GET** `/siswa/materi/:modulId`
  - Tujuan: list materi per modul.

### F. Submateri

- **GET** `/siswa/submateri/materi/:materiId`
  - Tujuan: list submateri per materi.
- **GET** `/siswa/submateri/:id`
  - Tujuan: detail submateri.

### G. Pretest

- **GET** `/siswa/pretest/:modulId`
  - Tujuan: ambil soal pretest pada modul.
- **POST** `/siswa/pretest/:modulId/submit`
  - Tujuan: submit jawaban pretest.
  - Body:
```json
{
  "answers": [
    { "questionId": "cuid-question", "answer": "A" }
  ]
}
```
  - Respons:
```json
{
  "score": 80
}
```

### H. Posttest

- **GET** `/siswa/posttest/:modulId`
  - Tujuan: ambil soal posttest pada modul.
- **POST** `/siswa/posttest/:modulId/submit`
  - Tujuan: submit jawaban posttest.
  - Body:
```json
{
  "answers": [
    { "questionId": "cuid-question", "answer": "B" }
  ]
}
```
  - Respons:
```json
{
  "score": 90,
  "certificate": null
}
```
  - Catatan: `certificate` terisi jika siswa memenuhi syarat kelulusan modul.

### I. Kuis

- **POST** `/siswa/kuis/submit`
  - Tujuan: submit 1 jawaban kuis.
  - Body:
```json
{
  "quizId": "cuid-quiz",
  "answer": "A",
  "knowledgeComponentId": "cuid-kc"
}
```
  - Respons:
```json
{
  "message": "Quiz submitted successfully",
  "isCorrect": true,
  "quizId": "cuid-quiz"
}
```
  - Catatan:
    - sistem menyimpan log jawaban
    - update knowledge state (BKT)
    - kirim notifikasi update

### J. Rating Modul

- **POST** `/siswa/rating/:id`
  - `:id` = `modulId`
  - Tujuan: beri rating pada modul.
  - Body:
```json
{
  "rating": 4,
  "komentar": "Materi mudah dipahami"
}
```
  - Catatan:
    - 1 siswa hanya bisa rating 1x per modul
    - jika duplikat, respons `403`

### K. Sertifikat

- **GET** `/siswa/certificates`
  - Tujuan: list sertifikat milik siswa.
  - Mendukung pagination (`limit`, `cursor`).
- **GET** `/siswa/certificates/:id`
  - Tujuan: detail sertifikat.
  - Akses ditolak jika sertifikat bukan milik user login.

### L. Profile

- **GET** `/siswa/profile/profile`
  - Tujuan: ambil profil siswa login.
  - Field utama: `id`, `nama_lengkap`, `email`, `jenjang`, `kelas_sekolah`, `profileImage`, `role`, `studentType`, `createdAt`.

---

## 5) Endpoint Role Umum

Base prefix: `/umum`

> Role `umum` menggunakan struktur yang mirip siswa untuk beberapa modul, tetapi dibatasi hanya untuk konten tipe `UMUM`.

### A. Modul

- **GET** `/umum/modul`
  - Tujuan: list modul dengan filter tipe `UMUM`.
  - Mendukung `limit`, `cursor`.
- **GET** `/umum/modul/enrolled`
  - Tujuan: list modul `UMUM` yang sudah di-enroll user.
- **GET** `/umum/modul/:id`
  - Tujuan: detail modul.
  - Akan `404` jika modul bukan tipe `UMUM`.
- **POST** `/umum/modul/:id/enroll`
  - Tujuan: enroll user umum ke modul `UMUM`.
  - Aturan sama: tidak boleh draft, tidak boleh paid (tanpa purchase flow), tidak boleh dobel enroll.

### B. Kuis

- **POST** `/umum/kuis/submit`
  - Body sama seperti siswa:
```json
{
  "quizId": "cuid-quiz",
  "answer": "A",
  "knowledgeComponentId": "cuid-kc"
}
```
  - Respons:
```json
{
  "message": "Quiz submitted successfully",
  "isCorrect": true,
  "quizId": "cuid-quiz"
}
```

### C. Progress

- **GET** `/umum/progress`
  - Tujuan: list progress semua modul yang diikuti user umum.
- **GET** `/umum/progress/:modulId`
  - Tujuan: detail progress user umum per modul.

### D. Profile

- **GET** `/umum/profile/profile`
  - Tujuan: ambil profil user umum login.
  - Field yang dikembalikan sama dengan profil siswa (`id`, `nama_lengkap`, `email`, dll).

---

## 6) Alur Pemakaian yang Disarankan

### Alur Siswa (umum dipakai di frontend)
1. Login via `/auth/login`.
2. Ambil daftar modul via `/siswa/modul`.
3. Enroll modul via `/siswa/modul/:id/enroll`.
4. Ambil topik/materi/submateri:
   - `/siswa/topik/:modulId`
   - `/siswa/materi/:modulId`
   - `/siswa/submateri/materi/:materiId`
5. Tandai submateri selesai via `/siswa/progress/submateri/:submateriId/complete`.
6. Kerjakan pretest/posttest + kuis:
   - `/siswa/pretest/:modulId/submit`
   - `/siswa/posttest/:modulId/submit`
   - `/siswa/kuis/submit`
7. Lihat progress/sertifikat/dashboard:
   - `/siswa/progress`
   - `/siswa/certificates`
   - `/siswa/dashboard`

### Alur Umum
1. Login via `/auth/login`.
2. Ambil modul publik `UMUM` via `/umum/modul`.
3. Enroll `/umum/modul/:id/enroll`.
4. Kerjakan kuis `/umum/kuis/submit`.
5. Pantau progress `/umum/progress` dan profil `/umum/profile/profile`.

---

## 7) Kode Status yang Sering Muncul

- `200` sukses baca/aksi.
- `201` sukses create (contoh rating siswa).
- `400` request invalid (misal `limit` invalid, sudah enroll).
- `401` belum login / token tidak valid.
- `403` role tidak sesuai / akses ditolak.
- `404` data tidak ditemukan.
- `500` internal server error.

## 8) Catatan Implementasi Penting

- Token dibaca dari cookie `token` (bukan header Bearer) oleh middleware auth saat ini.
- Endpoint `/siswa/*` dan `/umum/*` sudah di-protect di level router role.
- Beberapa modul punya notifikasi realtime (enroll, progress, quiz).
- Endpoint profile saat ini memakai path `/profile/profile` (sesuai route yang ada).

