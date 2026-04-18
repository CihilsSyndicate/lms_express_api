/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `siswa` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleId]` on the table `Tutor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `siswa` ADD COLUMN `googleId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `tutor` ADD COLUMN `googleId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `siswa_googleId_key` ON `siswa`(`googleId`);

-- CreateIndex
CREATE UNIQUE INDEX `Tutor_googleId_key` ON `Tutor`(`googleId`);
