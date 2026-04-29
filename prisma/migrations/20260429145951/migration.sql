-- CreateTable
CREATE TABLE "siswa" (
    "id" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "jenjang" TEXT NOT NULL,
    "kelas_sekolah" TEXT NOT NULL,
    "profile_img" TEXT,
    "role" TEXT NOT NULL DEFAULT 'siswa',
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tutor" (
    "id" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "no_whatsapp" TEXT NOT NULL,
    "pendidikan_terakhir" TEXT NOT NULL,
    "nama_instansi" TEXT NOT NULL,
    "prodi" TEXT NOT NULL,
    "cv_path_url" TEXT NOT NULL,
    "profile_img" TEXT,
    "role" TEXT NOT NULL DEFAULT 'tutor',
    "googleId" TEXT,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modul" (
    "id" TEXT NOT NULL,
    "nama_modul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "target_waktu" INTEGER NOT NULL,
    "tingkat_kesulitan" TEXT NOT NULL,
    "is_berbayar" BOOLEAN NOT NULL DEFAULT false,
    "harga_modul" DECIMAL(65,30),
    "jenjang" TEXT NOT NULL,
    "kelas_sekolah" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "pretest_id" TEXT,
    "posttest_id" TEXT,

    CONSTRAINT "Modul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materi" (
    "id" TEXT NOT NULL,
    "modul_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "is_video" BOOLEAN NOT NULL DEFAULT false,
    "video_url" TEXT,
    "article" TEXT,

    CONSTRAINT "Materi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submateri" (
    "id" TEXT NOT NULL,
    "materi_id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "konten" TEXT NOT NULL,

    CONSTRAINT "Submateri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topik" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "modul_id" TEXT NOT NULL,

    CONSTRAINT "Topik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pretest" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Pretest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posttest" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Posttest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoalPretest" (
    "id" TEXT NOT NULL,
    "pretest_id" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "pilihan" JSONB NOT NULL,
    "jawaban_benar" TEXT NOT NULL,
    "skor" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "SoalPretest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoalPosttest" (
    "id" TEXT NOT NULL,
    "posttest_id" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "pilihan" JSONB NOT NULL,
    "jawaban_benar" TEXT NOT NULL,
    "skor" INTEGER NOT NULL DEFAULT 10,

    CONSTRAINT "SoalPosttest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "modul_id" TEXT NOT NULL,
    "skor_pretest" INTEGER,
    "skor_posttest" INTEGER,
    "nilai_akhir" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "is_lulus" BOOLEAN NOT NULL DEFAULT false,
    "last_accessed" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressDetail" (
    "id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "submateri_id" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "ProgressDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "modul_id" TEXT NOT NULL,
    "kode_sertif" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url_sertif" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_component" (
    "id" TEXT NOT NULL,
    "modul_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pretest_question_skill_map" (
    "id" TEXT NOT NULL,
    "soal_pretest_id" TEXT NOT NULL,
    "knowledge_component_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "pretest_question_skill_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answer_log" (
    "id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "modul_id" TEXT NOT NULL,
    "question_source" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "knowledge_component_id" TEXT,
    "is_correct" BOOLEAN NOT NULL,
    "attempt_no" INTEGER NOT NULL DEFAULT 1,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_answer_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_knowledge_state" (
    "id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "modul_id" TEXT NOT NULL,
    "knowledge_component_id" TEXT NOT NULL,
    "p_init" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "p_learn" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "p_guess" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "p_slip" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "p_mastery_current" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_knowledge_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_unlock_rule" (
    "id" TEXT NOT NULL,
    "modul_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "knowledge_component_id" TEXT NOT NULL,
    "mastery_threshold" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "minimum_pretest_score" INTEGER,

    CONSTRAINT "module_unlock_rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "siswa_email_key" ON "siswa"("email");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_googleId_key" ON "siswa"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_email_key" ON "Tutor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_googleId_key" ON "Tutor"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Modul_pretest_id_key" ON "Modul"("pretest_id");

-- CreateIndex
CREATE UNIQUE INDEX "Modul_posttest_id_key" ON "Modul"("posttest_id");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_siswa_id_modul_id_key" ON "Progress"("siswa_id", "modul_id");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_kode_sertif_key" ON "Certificate"("kode_sertif");

-- CreateIndex
CREATE UNIQUE INDEX "pretest_question_skill_map_soal_pretest_id_knowledge_compon_key" ON "pretest_question_skill_map"("soal_pretest_id", "knowledge_component_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_knowledge_state_siswa_id_modul_id_knowledge_compone_key" ON "student_knowledge_state"("siswa_id", "modul_id", "knowledge_component_id");

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_pretest_id_fkey" FOREIGN KEY ("pretest_id") REFERENCES "Pretest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_posttest_id_fkey" FOREIGN KEY ("posttest_id") REFERENCES "Posttest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materi" ADD CONSTRAINT "Materi_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materi" ADD CONSTRAINT "Materi_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submateri" ADD CONSTRAINT "Submateri_materi_id_fkey" FOREIGN KEY ("materi_id") REFERENCES "Materi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topik" ADD CONSTRAINT "Topik_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoalPretest" ADD CONSTRAINT "SoalPretest_pretest_id_fkey" FOREIGN KEY ("pretest_id") REFERENCES "Pretest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoalPosttest" ADD CONSTRAINT "SoalPosttest_posttest_id_fkey" FOREIGN KEY ("posttest_id") REFERENCES "Posttest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressDetail" ADD CONSTRAINT "ProgressDetail_submateri_id_fkey" FOREIGN KEY ("submateri_id") REFERENCES "Submateri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_component" ADD CONSTRAINT "knowledge_component_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pretest_question_skill_map" ADD CONSTRAINT "pretest_question_skill_map_soal_pretest_id_fkey" FOREIGN KEY ("soal_pretest_id") REFERENCES "SoalPretest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pretest_question_skill_map" ADD CONSTRAINT "pretest_question_skill_map_knowledge_component_id_fkey" FOREIGN KEY ("knowledge_component_id") REFERENCES "knowledge_component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answer_log" ADD CONSTRAINT "student_answer_log_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answer_log" ADD CONSTRAINT "student_answer_log_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answer_log" ADD CONSTRAINT "student_answer_log_knowledge_component_id_fkey" FOREIGN KEY ("knowledge_component_id") REFERENCES "knowledge_component"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_knowledge_state" ADD CONSTRAINT "student_knowledge_state_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_knowledge_state" ADD CONSTRAINT "student_knowledge_state_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_knowledge_state" ADD CONSTRAINT "student_knowledge_state_knowledge_component_id_fkey" FOREIGN KEY ("knowledge_component_id") REFERENCES "knowledge_component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_unlock_rule" ADD CONSTRAINT "module_unlock_rule_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_unlock_rule" ADD CONSTRAINT "module_unlock_rule_knowledge_component_id_fkey" FOREIGN KEY ("knowledge_component_id") REFERENCES "knowledge_component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
