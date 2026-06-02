# Dokumentasi API Role Admin

Dokumentasi ini khusus untuk endpoint role `admin` pada backend LMS Express API.

## 1) Ringkasan Akses

- Base URL lokal: `http://localhost:3000`
- Prefix role: `/admin/*`
- Semua endpoint di bawah `/admin` **wajib login** dan memakai middleware:
  - `verifyToken` (validasi cookie JWT)
  - `requireRole('admin')`

## 2) Cara Pakai (Auth & Session)

### Login

- Endpoint: `POST /auth/login`
- Body:
```json
{
  "email": "admin@mail.com",
  "password": "secret"
}
```
- Jika berhasil, server set cookie:
  - `token` (access token, 1 hari)
  - `refreshToken` (7 hari)

### Refresh Token

- Endpoint: `POST /auth/refresh`
- Gunakan saat `token` expired (dengan `refreshToken` cookie masih valid).

### Logout

- Endpoint: `POST /auth/logout`
- Membersihkan cookie `token` dan `refreshToken`.

## 3) Konvensi Umum Endpoint

- Pagination (pada `GET` list tertentu): gunakan query parameter:
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

## 4) Peta Endpoint Admin

| Grup          | Base Path                         | Deskripsi Singkat                       |
|---------------|-----------------------------------|-----------------------------------------|
| Dashboard     | `/admin/dashboard`                | Statistik ringkasan platform            |
| Modul         | `/admin/modul`                    | CRUD modul pembelajaran                 |
| Modul (alias) | `/admin/manage/module`            | Alias untuk endpoint modul              |
| Topik         | `/admin/topik`                    | CRUD topik dalam modul                  |
| Materi        | `/admin/materi`                   | CRUD materi dalam topik/modul           |
| Kuis          | `/admin/kuis`                     | CRUD soal kuis                          |
| Pengelolaan Siswa | `/admin/siswa`                | CRUD dan manajemen akun siswa           |
| Pengelolaan Siswa (alias) | `/admin/manage/siswa` | Alias untuk endpoint siswa          |
| Pengelolaan Tutor | `/admin/tutor`                | CRUD dan manajemen akun tutor           |
| Pengelolaan Tutor (alias) | `/admin/manage/tutor` | Alias untuk endpoint tutor          |
| Progress      | `/admin/progress`                 | Pantau & analisis progress siswa        |
| Profile       | `/admin/profile`                  | Profil admin login                      |

---

## 5) Endpoint Dashboard

Base prefix: `/admin/dashboard`

### GET `/admin/dashboard/`

- **Tujuan**: Mendapatkan statistik ringkasan platform.
- **Auth**: Wajib (admin)
- **Respons `200`**:
```json
{
  "activeStudents": 120,
  "activeQuizzes": 45,
  "activeTutors": 10,
  "activeModules": 8,
  "countAllUsers": 130,
  "activeClass": 8
}
```

| Field | Tipe | Keterangan |
|---|---|---|
| `activeStudents` | `number` | Jumlah total siswa terdaftar |
| `activeQuizzes` | `number` | Jumlah total soal kuis |
| `activeTutors` | `number` | Jumlah total tutor terdaftar |
| `activeModules` | `number` | Jumlah modul yang bukan draft |
| `countAllUsers` | `number` | Total siswa + tutor |
| `activeClass` | `number` | Sama dengan `activeModules` |

---

## 6) Endpoint Modul

Base prefix: `/admin/modul` (juga bisa via alias `/admin/manage/module`)

### GET `/admin/modul`

- **Tujuan**: List semua modul (termasuk draft).
- **Query params**: `limit`, `cursor`
- **Respons `200`** (format pagination):
```json
{
  "items": [
    {
      "id": "cuid-modul",
      "moduleName": "Pengenalan Algoritma",
      "isDraft": false,
      "type": "SISWA"
    }
  ],
  "next_cursor": "base64-cursor-atau-null"
}
```

### GET `/admin/modul/:id`

- **Tujuan**: Detail satu modul berdasarkan ID.
- **Params**: `:id` = ID modul
- **Respons `200`**: Objek modul lengkap.
- **Respons `404`**: `{ "error": "Module not found" }`

### POST `/admin/modul`

- **Tujuan**: Membuat modul baru.
- **Body** (contoh):
```json
{
  "moduleName": "Nama Modul",
  "description": "Deskripsi modul",
  "type": "SISWA",
  "isDraft": true,
  "tutorId": "cuid-tutor"
}
```
- **Respons `201`**: Objek modul yang baru dibuat.
- **Respons `500`**: `{ "error": "Failed to create module" }`

### PUT `/admin/modul/:id`

- **Tujuan**: Update data modul.
- **Params**: `:id` = ID modul
- **Body** (semua field opsional, kirim yang ingin diubah):
```json
{
  "moduleName": "Nama Baru",
  "description": "Deskripsi baru",
  "isDraft": false,
  "tutorId": "cuid-tutor-baru"
}
```
- **Respons `200`**: Objek modul yang telah diupdate.
- **Respons `404`**: `{ "error": "Module not found or unauthorized" }`

### DELETE `/admin/modul/:id`

- **Tujuan**: Menghapus modul beserta relasinya.
- **Params**: `:id` = ID modul
- **Body** (opsional):
```json
{
  "tutorId": "cuid-tutor"
}
```
- **Respons `200`**: `{ "message": "Module deleted successfully" }`
- **Respons `404`**: `{ "message": "Module not found" }`

### POST `/admin/modul/assign`

- **Tujuan**: Assign siswa ke modul tertentu secara manual oleh admin. Siswa akan mendapat notifikasi realtime.
- **Body**:
```json
{
  "moduleId": "cuid-modul",
  "studentId": "cuid-siswa"
}
```
- **Respons `200`**: Objek enrollment yang berhasil dibuat.
- **Respons `400`**: `{ "error": "Student is already assigned to this module" }`
- **Respons `404`**: `{ "error": "Student not found" }` atau `{ "error": "Module not found" }`
- **Catatan**: Setelah berhasil, notifikasi realtime dikirimkan ke siswa.

### DELETE `/admin/modul/unassign`

- **Tujuan**: Cabut akses siswa dari modul.
- **Body**:
```json
{
  "moduleId": "cuid-modul",
  "studentId": "cuid-siswa"
}
```
- **Respons `200`**: Hasil operasi unassign.
- **Respons `500`**: `{ "error": "Failed to unassign student from module" }`

### GET `/admin/modul/assigned`

- **Tujuan**: Cari data enrollment (siswa yang sudah di-assign ke suatu modul).
- **Body**:
```json
{
  "moduleId": "cuid-modul",
  "studentId": "cuid-siswa"
}
```
- **Respons `200`**: Array enrollment yang cocok.

---

## 7) Endpoint Topik

Base prefix: `/admin/topik`

### GET `/admin/topik/:modulId`

- **Tujuan**: Mendapatkan list topik dalam satu modul.
- **Params**: `:modulId` = ID modul
- **Respons `200`**: Array objek topik.
- **Respons `404`**: `{ "message": "..." }` jika modul tidak ditemukan (dari `AppError`).

### POST `/admin/topik`

- **Tujuan**: Membuat topik baru dalam suatu modul.
- **Body**:
```json
{
  "name": "Nama Topik",
  "modulId": "cuid-modul",
  "order": 1
}
```
- **Respons `201`**: Objek topik yang baru dibuat.
- **Respons `400/404`**: Jika validasi gagal (via `AppError`).

### PUT `/admin/topik/:id`

- **Tujuan**: Update data topik.
- **Params**: `:id` = ID topik
- **Body** (field yang ingin diubah):
```json
{
  "name": "Nama Topik Baru",
  "order": 2
}
```
- **Respons `200`**: Objek topik yang telah diupdate.

### DELETE `/admin/topik/:id`

- **Tujuan**: Menghapus topik.
- **Params**: `:id` = ID topik
- **Respons `200`**: Objek topik yang dihapus.
- **Respons `403/404`**: Jika tidak punya akses atau topik tidak ditemukan (via `AppError`).

---

## 8) Endpoint Materi

Base prefix: `/admin/materi`

### GET `/admin/materi/:modulId`

- **Tujuan**: Mendapatkan list materi berdasarkan modul.
- **Params**: `:modulId` = ID modul
- **Respons `200`**: Array objek materi.

### POST `/admin/materi`

- **Tujuan**: Membuat materi baru.
- **Body**:
```json
{
  "title": "Judul Materi",
  "topikId": "cuid-topik",
  "modulId": "cuid-modul",
  "order": 1
}
```
- **Respons `201`**: Objek materi yang baru dibuat.
- **Respons `400/404`**: Jika validasi gagal (via `AppError`).

### PUT `/admin/materi/:id`

- **Tujuan**: Update materi.
- **Params**: `:id` = ID materi
- **Body** (field yang ingin diubah):
```json
{
  "title": "Judul Baru",
  "order": 2
}
```
- **Respons `200`**: Objek materi yang telah diupdate.

### DELETE `/admin/materi/:id`

- **Tujuan**: Menghapus materi.
- **Params**: `:id` = ID materi
- **Respons `200`**: Objek materi yang dihapus.
- **Respons `403/404`**: Jika tidak punya akses atau materi tidak ditemukan (via `AppError`).

---

## 9) Endpoint Kuis

Base prefix: `/admin/kuis`

### GET `/admin/kuis`

- **Tujuan**: List semua soal kuis.
- **Query params**: `limit`, `cursor`
- **Respons `200`** (format pagination):
```json
{
  "items": [
    {
      "id": "cuid-quiz",
      "question": "Apa itu algoritma?",
      "optionA": "...",
      "optionB": "...",
      "optionC": "...",
      "optionD": "...",
      "answer": "A"
    }
  ],
  "next_cursor": null
}
```
- **Respons `400`**: `{ "message": "Invalid limit parameter" }` atau `{ "message": "Invalid cursor" }`

### GET `/admin/kuis/:id`

- **Tujuan**: Detail satu soal kuis berdasarkan ID.
- **Params**: `:id` = ID kuis
- **Respons `200`**: Objek soal kuis.
- **Respons `404`**: `{ "error": "Quiz not found" }`

### POST `/admin/kuis`

- **Tujuan**: Membuat soal kuis baru.
- **Body**:
```json
{
  "question": "Pertanyaan kuis?",
  "optionA": "Pilihan A",
  "optionB": "Pilihan B",
  "optionC": "Pilihan C",
  "optionD": "Pilihan D",
  "answer": "A",
  "knowledgeComponentId": "cuid-kc",
  "submateriId": "cuid-submateri"
}
```
- **Respons `201`**: Objek soal kuis yang baru dibuat.
- **Respons `500`**: `{ "error": "Failed to create quiz" }`

### PUT `/admin/kuis/:id`

- **Tujuan**: Update soal kuis.
- **Params**: `:id` = ID kuis
- **Body** (field yang ingin diubah):
```json
{
  "question": "Pertanyaan diupdate?",
  "answer": "B"
}
```
- **Respons `200`**: Objek soal kuis yang telah diupdate.

### DELETE `/admin/kuis/:id`

- **Tujuan**: Menghapus soal kuis.
- **Params**: `:id` = ID kuis
- **Respons `200`**: Objek soal kuis yang dihapus.
- **Respons `500`**: `{ "error": "Failed to delete quiz" }`

---

## 10) Endpoint Pengelolaan Siswa

Base prefix: `/admin/siswa` (juga bisa via alias `/admin/manage/siswa`)

### GET `/admin/siswa`

- **Tujuan**: Mendapatkan semua data siswa.
- **Respons `200`**: Array objek siswa (seluruh field).

### GET `/admin/siswa/search`

- **Tujuan**: Mencari siswa berdasarkan nama atau email.
- **Query params**:
  - `q` (string, **wajib**, minimal 2 karakter) — kata kunci pencarian
- **Contoh request**: `GET /admin/siswa/search?q=budi`
- **Respons `200`**: Array maksimal 20 siswa yang cocok, diurutkan dari terbaru.
- **Respons `400`**: `{ "message": "Kata kunci minimal 2 karakter." }`

### POST `/admin/siswa`

- **Tujuan**: Mendaftarkan siswa baru.
- **Body**:
```json
{
  "nama_lengkap": "Budi Santoso",
  "email": "budi@mail.com",
  "password": "password123",
  "jenjang": "SMA",
  "kelas_sekolah": "10",
  "studentType": "SISWA"
}
```
- **Respons `201`**: Objek siswa yang baru didaftarkan.

### PUT `/admin/siswa/:id`

- **Tujuan**: Update profil siswa.
- **Params**: `:id` = ID siswa
- **Body** (field yang ingin diubah):
```json
{
  "nama_lengkap": "Budi Santoso Updated",
  "kelas_sekolah": "11"
}
```
- **Respons `200`**: Objek profil siswa yang telah diupdate.
- **Respons `500`**: `{ "message": "Gagal memperbarui profil siswa.", "error": "..." }`

### DELETE `/admin/siswa/:id`

- **Tujuan**: Menghapus akun siswa secara permanen.
- **Params**: `:id` = ID siswa
- **Respons `200`**: Konfirmasi penghapusan.
- **Respons `500`**: `{ "message": "Gagal menghapus siswa." }`

### PATCH `/admin/siswa/:id/deactivate`

- **Tujuan**: Menonaktifkan akun siswa (soft disable).
- **Params**: `:id` = ID siswa
- **Respons `200`**: Objek siswa dengan status nonaktif.
- **Respons `500`**: `{ "message": "Gagal menonaktifkan siswa." }`

### PATCH `/admin/siswa/:id/activate`

- **Tujuan**: Mengaktifkan kembali akun siswa yang nonaktif.
- **Params**: `:id` = ID siswa
- **Respons `200`**: Objek siswa dengan status aktif.
- **Respons `500`**: `{ "message": "Gagal mengaktifkan siswa." }`

---

## 11) Endpoint Pengelolaan Tutor

Base prefix: `/admin/tutor` (juga bisa via alias `/admin/manage/tutor`)

### GET `/admin/tutor`

- **Tujuan**: Mendapatkan semua data tutor.
- **Respons `200`**: Array objek tutor (seluruh field).

### GET `/admin/tutor/search`

- **Tujuan**: Mencari tutor berdasarkan nama lengkap atau email.
- **Query params**:
  - `q` (string, **wajib**, minimal 2 karakter) — kata kunci pencarian
- **Contoh request**: `GET /admin/tutor/search?q=andi`
- **Respons `200`**: Array maksimal 20 tutor yang cocok.
- **Respons `400`**: `{ "message": "Kata kunci minimal 2 karakter." }`

### POST `/admin/tutor`

- **Tujuan**: Mendaftarkan tutor baru.
- **Body**:
```json
{
  "fullName": "Andi Wijaya",
  "email": "andi@mail.com",
  "password": "password123",
  "gender": "MALE",
  "whatsappNumber": "08123456789"
}
```
- **Respons `201`**: Objek tutor yang baru didaftarkan.

### PUT `/admin/tutor/:id`

- **Tujuan**: Update profil tutor.
- **Params**: `:id` = ID tutor
- **Body** (field yang ingin diubah):
```json
{
  "fullName": "Andi Wijaya Updated",
  "whatsappNumber": "08987654321"
}
```
- **Respons `200`**: Objek profil tutor yang telah diupdate.
- **Respons `500`**: `{ "message": "Gagal memperbarui profil tutor.", "error": "..." }`

### DELETE `/admin/tutor/:id`

- **Tujuan**: Menghapus akun tutor secara permanen.
- **Params**: `:id` = ID tutor
- **Respons `200`**: Konfirmasi penghapusan.
- **Respons `500`**: `{ "message": "Gagal menghapus tutor." }`

### PATCH `/admin/tutor/:id/deactivate`

- **Tujuan**: Menonaktifkan akun tutor (soft disable).
- **Params**: `:id` = ID tutor
- **Respons `200`**: Objek tutor dengan status nonaktif.
- **Respons `500`**: `{ "message": "Gagal menonaktifkan tutor." }`

---

## 12) Endpoint Progress (Admin View)

Base prefix: `/admin/progress`

### GET `/admin/progress`

- **Tujuan**: Mendapatkan ringkasan progress semua siswa, dikelompokkan per modul.
- **Body (opsional)** untuk pagination:
```json
{
  "limit": 10,
  "cursor": "base64-cursor"
}
```
- **Respons `200`**: Array progress seluruh siswa.
- **Respons `500`**: `{ "message": "Failed to fetch student progress..." }`

### GET `/admin/progress/:studentId`

- **Tujuan**: Mendapatkan detail progress satu siswa.
- **Params**: `:studentId` = ID siswa
- **Respons `200`**: Objek progress siswa (per modul, per materi, dll).
- **Respons `500`**: `{ "message": "Failed to fetch student progress by ID..." }`

### GET `/admin/progress/:studentId/analyze`

- **Tujuan**: Menganalisis kemampuan **Computational Thinking** (CT) siswa berdasarkan riwayat kuis.
- **Params**: `:studentId` = ID siswa
- **Respons `200`** (contoh):
```json
{
  "studentId": "cuid-siswa",
  "decomposition": 0.85,
  "abstraction": 0.72,
  "patternRecognition": 0.90,
  "algorithm": 0.68,
  "overall": 0.79
}
```
- **Respons `500`**: `{ "message": "Failed to fetch computational thinking progress..." }`

---

## 13) Endpoint Profile Admin

Base prefix: `/admin/profile`

### GET `/admin/profile/profile`

- **Tujuan**: Mendapatkan profil admin yang sedang login.
- **Respons `200`**:
```json
{
  "id": "cuid-admin",
  "email": "admin@mail.com",
  "username": "admin01",
  "fullName": "Administrator",
  "gender": "MALE",
  "whatsappNumber": "08123456789",
  "profileImg": "https://...",
  "role": "admin"
}
```
- **Respons `401`**: `{ "message": "Unauthenticated" }` — jika tidak ada sesi aktif.
- **Respons `404`**: `{ "message": "Admin tidak ditemukan." }`

---

## 14) Alur Pemakaian yang Disarankan

### Alur Manajemen Konten (Modul → Topik → Materi → Kuis)

1. Login via `POST /auth/login`.
2. Lihat dashboard via `GET /admin/dashboard/`.
3. Buat modul baru via `POST /admin/modul`.
4. Tambahkan topik ke modul via `POST /admin/topik`.
5. Tambahkan materi ke topik/modul via `POST /admin/materi`.
6. Tambahkan soal kuis via `POST /admin/kuis`.
7. Publikasikan modul dengan update status draft via `PUT /admin/modul/:id` (`isDraft: false`).

### Alur Manajemen Siswa

1. Daftarkan siswa baru via `POST /admin/siswa`.
2. Assign siswa ke modul via `POST /admin/modul/assign`.
3. Pantau progress siswa via `GET /admin/progress/:studentId`.
4. Analisis CT siswa via `GET /admin/progress/:studentId/analyze`.
5. Nonaktifkan siswa jika diperlukan via `PATCH /admin/siswa/:id/deactivate`.

### Alur Manajemen Tutor

1. Daftarkan tutor baru via `POST /admin/tutor`.
2. Assign tutor ke modul saat membuat/update modul dengan mengisi `tutorId`.
3. Update data tutor via `PUT /admin/tutor/:id`.
4. Nonaktifkan tutor via `PATCH /admin/tutor/:id/deactivate`.

---

## 15) Kode Status yang Sering Muncul

| Kode | Makna |
|---|---|
| `200` | Sukses baca / aksi |
| `201` | Sukses membuat resource baru |
| `400` | Request tidak valid (misal: query `q` kurang dari 2 karakter, pagination invalid, sudah ter-assign) |
| `401` | Belum login / token tidak valid |
| `403` | Role tidak sesuai / akses ditolak |
| `404` | Data tidak ditemukan |
| `500` | Internal server error |

---

## 16) Catatan Implementasi Penting

- Token dibaca dari cookie `token` (bukan header Bearer) oleh middleware auth.
- Semua endpoint `/admin/*` di-protect di level router oleh `verifyToken` + `requireRole('admin')`.
- Endpoint modul dan siswa masing-masing memiliki **alias path** yang bisa digunakan secara bergantian:
  - `/admin/modul` ↔ `/admin/manage/module`
  - `/admin/siswa` ↔ `/admin/manage/siswa`
  - `/admin/tutor` ↔ `/admin/manage/tutor`
- Operasi **assign siswa ke modul** mengirimkan **notifikasi realtime** ke siswa yang bersangkutan.
- Analisis Computational Thinking di `/admin/progress/:studentId/analyze` berbasis riwayat jawaban kuis menggunakan sistem BKT (Bayesian Knowledge Tracing).
- Endpoint `POST /admin/materi` dan `POST /admin/topik` menyertakan `req.user.id` dan `req.user.role` ke service untuk keperluan audit/otorisasi di layer bawah.
