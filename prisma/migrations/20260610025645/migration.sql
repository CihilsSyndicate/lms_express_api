/*
  Warnings:

  - Made the column `gender` on table `Tutor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pekerjaan` on table `Tutor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `whatsappNumber` on table `Tutor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastEducation` on table `Tutor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `institution` on table `Tutor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `prodi` on table `Tutor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cvPathUrl` on table `Tutor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Tutor" ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "pekerjaan" SET NOT NULL,
ALTER COLUMN "whatsappNumber" SET NOT NULL,
ALTER COLUMN "lastEducation" SET NOT NULL,
ALTER COLUMN "institution" SET NOT NULL,
ALTER COLUMN "prodi" SET NOT NULL,
ALTER COLUMN "cvPathUrl" SET NOT NULL;
