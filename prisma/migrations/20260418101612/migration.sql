-- AlterTable
ALTER TABLE `siswa` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'siswa';

-- AlterTable
ALTER TABLE `tutor` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'tutor';
