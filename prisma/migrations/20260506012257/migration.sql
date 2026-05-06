/*
  Warnings:

  - You are about to drop the `Certificate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ComputationalThinking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JawabanKuis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Kuis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Materi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Modul` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Posttest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pretest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProgressDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rating` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Signature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SoalPosttest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SoalPretest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Submateri` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Topik` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tutor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `knowledge_component` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `module_unlock_rule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pretest_question_skill_map` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `siswa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_answer_log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_knowledge_state` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_modul_id_fkey";

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_siswa_id_fkey";

-- DropForeignKey
ALTER TABLE "ComputationalThinking" DROP CONSTRAINT "ComputationalThinking_modul_id_fkey";

-- DropForeignKey
ALTER TABLE "JawabanKuis" DROP CONSTRAINT "JawabanKuis_kuis_id_fkey";

-- DropForeignKey
ALTER TABLE "Kuis" DROP CONSTRAINT "Kuis_submateri_id_fkey";

-- DropForeignKey
ALTER TABLE "Materi" DROP CONSTRAINT "Materi_modul_id_fkey";

-- DropForeignKey
ALTER TABLE "Materi" DROP CONSTRAINT "Materi_tutor_id_fkey";

-- DropForeignKey
ALTER TABLE "Modul" DROP CONSTRAINT "Modul_posttest_id_fkey";

-- DropForeignKey
ALTER TABLE "Modul" DROP CONSTRAINT "Modul_pretest_id_fkey";

-- DropForeignKey
ALTER TABLE "Modul" DROP CONSTRAINT "Modul_tutor_id_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_modul_id_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_siswa_id_fkey";

-- DropForeignKey
ALTER TABLE "ProgressDetail" DROP CONSTRAINT "ProgressDetail_submateri_id_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_modul_id_fkey";

-- DropForeignKey
ALTER TABLE "Signature" DROP CONSTRAINT "Signature_tutor_id_fkey";

-- DropForeignKey
ALTER TABLE "SoalPosttest" DROP CONSTRAINT "SoalPosttest_posttest_id_fkey";

-- DropForeignKey
ALTER TABLE "SoalPretest" DROP CONSTRAINT "SoalPretest_pretest_id_fkey";

-- DropForeignKey
ALTER TABLE "Submateri" DROP CONSTRAINT "Submateri_materi_id_fkey";

-- DropForeignKey
ALTER TABLE "Topik" DROP CONSTRAINT "Topik_modul_id_fkey";

-- DropForeignKey
ALTER TABLE "knowledge_component" DROP CONSTRAINT "knowledge_component_modul_id_fkey";

-- DropForeignKey
ALTER TABLE "module_unlock_rule" DROP CONSTRAINT "module_unlock_rule_knowledge_component_id_fkey";

-- DropForeignKey
ALTER TABLE "module_unlock_rule" DROP CONSTRAINT "module_unlock_rule_modul_id_fkey";

-- DropForeignKey
ALTER TABLE "pretest_question_skill_map" DROP CONSTRAINT "pretest_question_skill_map_knowledge_component_id_fkey";

-- DropForeignKey
ALTER TABLE "pretest_question_skill_map" DROP CONSTRAINT "pretest_question_skill_map_soal_pretest_id_fkey";

-- DropForeignKey
ALTER TABLE "student_answer_log" DROP CONSTRAINT "student_answer_log_knowledge_component_id_fkey";

-- DropForeignKey
ALTER TABLE "student_answer_log" DROP CONSTRAINT "student_answer_log_modul_id_fkey";

-- DropForeignKey
ALTER TABLE "student_answer_log" DROP CONSTRAINT "student_answer_log_siswa_id_fkey";

-- DropForeignKey
ALTER TABLE "student_knowledge_state" DROP CONSTRAINT "student_knowledge_state_knowledge_component_id_fkey";

-- DropForeignKey
ALTER TABLE "student_knowledge_state" DROP CONSTRAINT "student_knowledge_state_modul_id_fkey";

-- DropForeignKey
ALTER TABLE "student_knowledge_state" DROP CONSTRAINT "student_knowledge_state_siswa_id_fkey";

-- DropTable
DROP TABLE "Certificate";

-- DropTable
DROP TABLE "ComputationalThinking";

-- DropTable
DROP TABLE "JawabanKuis";

-- DropTable
DROP TABLE "Kuis";

-- DropTable
DROP TABLE "Materi";

-- DropTable
DROP TABLE "Modul";

-- DropTable
DROP TABLE "Posttest";

-- DropTable
DROP TABLE "Pretest";

-- DropTable
DROP TABLE "Progress";

-- DropTable
DROP TABLE "ProgressDetail";

-- DropTable
DROP TABLE "Rating";

-- DropTable
DROP TABLE "Signature";

-- DropTable
DROP TABLE "SoalPosttest";

-- DropTable
DROP TABLE "SoalPretest";

-- DropTable
DROP TABLE "Submateri";

-- DropTable
DROP TABLE "Topik";

-- DropTable
DROP TABLE "Tutor";

-- DropTable
DROP TABLE "knowledge_component";

-- DropTable
DROP TABLE "module_unlock_rule";

-- DropTable
DROP TABLE "pretest_question_skill_map";

-- DropTable
DROP TABLE "siswa";

-- DropTable
DROP TABLE "student_answer_log";

-- DropTable
DROP TABLE "student_knowledge_state";
