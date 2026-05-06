/*
  Warnings:

  - Added the required column `updatedAt` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProgressDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Signature` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tutor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `knowledge_component` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `module_unlock_rule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `pretest_question_skill_map` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `siswa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `student_answer_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `student_knowledge_state` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProgressDetail" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Signature" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Tutor" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "knowledge_component" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "module_unlock_rule" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "pretest_question_skill_map" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "siswa" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "student_answer_log" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "student_knowledge_state" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
