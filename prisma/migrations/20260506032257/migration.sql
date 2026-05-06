/*
  Warnings:

  - Added the required column `updatedAt` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ComputationalThinking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Materi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Modul` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Posttest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pretest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProgressDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SoalPosttest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SoalPretest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Submateri` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Topik` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `knowledge_component` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `pretest_question_skill_map` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `siswa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ComputationalThinking" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Materi" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Modul" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Posttest" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Pretest" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProgressDetail" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SoalPosttest" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SoalPretest" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Submateri" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Topik" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "knowledge_component" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "pretest_question_skill_map" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "siswa" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
