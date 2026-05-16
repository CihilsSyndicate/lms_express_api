-- CreateEnum
CREATE TYPE "ModulType" AS ENUM ('SISWA', 'UMUM');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('ARTICLE', 'QUIZ');

-- CreateEnum
CREATE TYPE "StudentType" AS ENUM ('SISWA', 'GURU');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "profileImg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modul" (
    "id" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetTime" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "modulPrice" DECIMAL(65,30),
    "level" TEXT,
    "class" TEXT,
    "pretestPostTestEnabled" BOOLEAN NOT NULL DEFAULT true,
    "hasStudyGroup" BOOLEAN NOT NULL DEFAULT false,
    "hasCertificate" BOOLEAN NOT NULL DEFAULT false,
    "moduleImgUrl" TEXT,
    "modulType" "ModulType" NOT NULL DEFAULT 'SISWA',
    "tutorId" TEXT NOT NULL,
    "pretestId" TEXT,
    "posttestId" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topik" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "modulId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopikItem" (
    "id" TEXT NOT NULL,
    "topikId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "itemType" "ItemType" NOT NULL DEFAULT 'ARTICLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopikItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materi" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "isVideo" BOOLEAN NOT NULL DEFAULT false,
    "videoUrl" TEXT,
    "article" TEXT,
    "topikId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Materi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submateri" (
    "id" TEXT NOT NULL,
    "materiId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submateri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "materiId" TEXT NOT NULL,
    "quizImgQuestionUrl" TEXT,
    "question" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "skor" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAnswerOption" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswerOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSetting" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "timeLimit" INTEGER,
    "allowMultipleAttempts" BOOLEAN NOT NULL DEFAULT false,
    "isComputationalThinkingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "minScoreTreshold" INTEGER,
    "standardScorePerQuestion" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pretest" (
    "id" TEXT NOT NULL,
    "pretestName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pretest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posttest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Posttest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoalPretest" (
    "id" TEXT NOT NULL,
    "pretestId" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "pretestQuestionImgUrl" TEXT,
    "correctAnswer" TEXT NOT NULL,
    "skor" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoalPretest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PretestAnswerOptions" (
    "id" TEXT NOT NULL,
    "soalPretestId" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PretestAnswerOptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PretestSetting" (
    "id" TEXT NOT NULL,
    "pretestId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "countShownQuestions" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PretestSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomaticAccessMatery" (
    "id" TEXT NOT NULL,
    "pretestId" TEXT,
    "materiId" TEXT NOT NULL,
    "minScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modulId" TEXT,
    "soalPretestId" TEXT,

    CONSTRAINT "AutomaticAccessMatery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoalPosttest" (
    "id" TEXT NOT NULL,
    "posttestId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "pilihan" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "skor" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoalPosttest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComputationalThinking" (
    "id" TEXT NOT NULL,
    "modulId" TEXT NOT NULL,
    "aspek" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComputationalThinking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "modulId" TEXT NOT NULL,
    "kode_sertif" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_component" (
    "id" TEXT NOT NULL,
    "modulId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pretest_question_skill_map" (
    "id" TEXT NOT NULL,
    "pretestQuestionId" TEXT NOT NULL,
    "knowledgeComponentId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pretest_question_skill_map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "komentar" TEXT,
    "siswaId" TEXT NOT NULL,
    "modulId" TEXT,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siswa" (
    "id" TEXT NOT NULL,
    "nama_lengkap" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "jenjang" TEXT NOT NULL,
    "kelas_sekolah" TEXT NOT NULL,
    "profileImage" TEXT,
    "role" TEXT NOT NULL DEFAULT 'siswa',
    "studentType" "StudentType" NOT NULL DEFAULT 'SISWA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "modulId" TEXT NOT NULL,
    "pretestScore" INTEGER,
    "posttestScore" INTEGER,
    "finalScore" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "isGraduated" BOOLEAN NOT NULL DEFAULT false,
    "lastAccessed" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressDetail" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "submateriId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answer_log" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "modulId" TEXT NOT NULL,
    "questionSource" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "knowledgeComponentId" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "attemptNo" INTEGER NOT NULL DEFAULT 1,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_answer_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_knowledge_state" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "modulId" TEXT NOT NULL,
    "knowledgeComponentId" TEXT NOT NULL,
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
    "modulId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "knowledgeComponentId" TEXT NOT NULL,
    "materyTreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "minimumPretestScore" INTEGER,

    CONSTRAINT "module_unlock_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tutor" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "whatsappNumber" TEXT NOT NULL,
    "lastEducation" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "biografi" TEXT,
    "prodi" TEXT NOT NULL,
    "cvPathUrl" TEXT NOT NULL,
    "profileImg" TEXT,
    "role" TEXT NOT NULL DEFAULT 'tutor',
    "googleId" TEXT,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signature" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,

    CONSTRAINT "Signature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMedia" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AutomaticAccessMateryToTopik" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AutomaticAccessMateryToTopik_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Modul_pretestId_key" ON "Modul"("pretestId");

-- CreateIndex
CREATE UNIQUE INDEX "Modul_posttestId_key" ON "Modul"("posttestId");

-- CreateIndex
CREATE UNIQUE INDEX "TopikItem_topikId_orderNumber_key" ON "TopikItem"("topikId", "orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_kode_sertif_key" ON "Certificate"("kode_sertif");

-- CreateIndex
CREATE UNIQUE INDEX "pretest_question_skill_map_pretestQuestionId_knowledgeCompo_key" ON "pretest_question_skill_map"("pretestQuestionId", "knowledgeComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_email_key" ON "siswa"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_siswaId_modulId_key" ON "Progress"("siswaId", "modulId");

-- CreateIndex
CREATE UNIQUE INDEX "student_knowledge_state_siswaId_modulId_knowledgeComponentI_key" ON "student_knowledge_state"("siswaId", "modulId", "knowledgeComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_email_key" ON "Tutor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_googleId_key" ON "Tutor"("googleId");

-- CreateIndex
CREATE INDEX "_AutomaticAccessMateryToTopik_B_index" ON "_AutomaticAccessMateryToTopik"("B");

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_pretestId_fkey" FOREIGN KEY ("pretestId") REFERENCES "Pretest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_posttestId_fkey" FOREIGN KEY ("posttestId") REFERENCES "Posttest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topik" ADD CONSTRAINT "Topik_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopikItem" ADD CONSTRAINT "TopikItem_topikId_fkey" FOREIGN KEY ("topikId") REFERENCES "Topik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materi" ADD CONSTRAINT "Materi_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materi" ADD CONSTRAINT "Materi_topikId_fkey" FOREIGN KEY ("topikId") REFERENCES "Topik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submateri" ADD CONSTRAINT "Submateri_materiId_fkey" FOREIGN KEY ("materiId") REFERENCES "Materi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_materiId_fkey" FOREIGN KEY ("materiId") REFERENCES "Materi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAnswerOption" ADD CONSTRAINT "QuizAnswerOption_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSetting" ADD CONSTRAINT "QuizSetting_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoalPretest" ADD CONSTRAINT "SoalPretest_pretestId_fkey" FOREIGN KEY ("pretestId") REFERENCES "Pretest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PretestAnswerOptions" ADD CONSTRAINT "PretestAnswerOptions_soalPretestId_fkey" FOREIGN KEY ("soalPretestId") REFERENCES "SoalPretest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PretestSetting" ADD CONSTRAINT "PretestSetting_pretestId_fkey" FOREIGN KEY ("pretestId") REFERENCES "Pretest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomaticAccessMatery" ADD CONSTRAINT "AutomaticAccessMatery_pretestId_fkey" FOREIGN KEY ("pretestId") REFERENCES "Pretest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomaticAccessMatery" ADD CONSTRAINT "AutomaticAccessMatery_materiId_fkey" FOREIGN KEY ("materiId") REFERENCES "Materi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomaticAccessMatery" ADD CONSTRAINT "AutomaticAccessMatery_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomaticAccessMatery" ADD CONSTRAINT "AutomaticAccessMatery_soalPretestId_fkey" FOREIGN KEY ("soalPretestId") REFERENCES "SoalPretest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoalPosttest" ADD CONSTRAINT "SoalPosttest_posttestId_fkey" FOREIGN KEY ("posttestId") REFERENCES "Posttest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComputationalThinking" ADD CONSTRAINT "ComputationalThinking_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_component" ADD CONSTRAINT "knowledge_component_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pretest_question_skill_map" ADD CONSTRAINT "pretest_question_skill_map_pretestQuestionId_fkey" FOREIGN KEY ("pretestQuestionId") REFERENCES "SoalPretest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pretest_question_skill_map" ADD CONSTRAINT "pretest_question_skill_map_knowledgeComponentId_fkey" FOREIGN KEY ("knowledgeComponentId") REFERENCES "knowledge_component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressDetail" ADD CONSTRAINT "ProgressDetail_submateriId_fkey" FOREIGN KEY ("submateriId") REFERENCES "Submateri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answer_log" ADD CONSTRAINT "student_answer_log_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answer_log" ADD CONSTRAINT "student_answer_log_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answer_log" ADD CONSTRAINT "student_answer_log_knowledgeComponentId_fkey" FOREIGN KEY ("knowledgeComponentId") REFERENCES "knowledge_component"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_knowledge_state" ADD CONSTRAINT "student_knowledge_state_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_knowledge_state" ADD CONSTRAINT "student_knowledge_state_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_knowledge_state" ADD CONSTRAINT "student_knowledge_state_knowledgeComponentId_fkey" FOREIGN KEY ("knowledgeComponentId") REFERENCES "knowledge_component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_unlock_rule" ADD CONSTRAINT "module_unlock_rule_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "module_unlock_rule" ADD CONSTRAINT "module_unlock_rule_knowledgeComponentId_fkey" FOREIGN KEY ("knowledgeComponentId") REFERENCES "knowledge_component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AutomaticAccessMateryToTopik" ADD CONSTRAINT "_AutomaticAccessMateryToTopik_A_fkey" FOREIGN KEY ("A") REFERENCES "AutomaticAccessMatery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AutomaticAccessMateryToTopik" ADD CONSTRAINT "_AutomaticAccessMateryToTopik_B_fkey" FOREIGN KEY ("B") REFERENCES "Topik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
