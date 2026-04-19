-- CreateTable
CREATE TABLE `siswa` (
    `id` VARCHAR(191) NOT NULL,
    `nama_lengkap` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `jenjang` VARCHAR(191) NOT NULL,
    `kelas_sekolah` VARCHAR(191) NOT NULL,
    `profile_img` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'siswa',
    `googleId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `siswa_email_key`(`email`),
    UNIQUE INDEX `siswa_googleId_key`(`googleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tutor` (
    `id` VARCHAR(191) NOT NULL,
    `nama_lengkap` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `pekerjaan` VARCHAR(191) NOT NULL,
    `no_whatsapp` VARCHAR(191) NOT NULL,
    `pendidikan_terakhir` VARCHAR(191) NOT NULL,
    `nama_instansi` VARCHAR(191) NOT NULL,
    `prodi` VARCHAR(191) NOT NULL,
    `cv_path_url` VARCHAR(191) NOT NULL,
    `profile_img` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'tutor',
    `googleId` VARCHAR(191) NULL,

    UNIQUE INDEX `Tutor_email_key`(`email`),
    UNIQUE INDEX `Tutor_googleId_key`(`googleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Modul` (
    `id` VARCHAR(191) NOT NULL,
    `nama_modul` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `target_waktu` INTEGER NOT NULL,
    `tingkat_kesulitan` VARCHAR(191) NOT NULL,
    `is_berbayar` BOOLEAN NOT NULL DEFAULT false,
    `harga_modul` DECIMAL(65, 30) NULL,
    `jenjang` VARCHAR(191) NOT NULL,
    `kelas_sekolah` VARCHAR(191) NOT NULL,
    `tutor_id` VARCHAR(191) NOT NULL,
    `pretest_id` VARCHAR(191) NULL,
    `posttest_id` VARCHAR(191) NULL,

    UNIQUE INDEX `Modul_pretest_id_key`(`pretest_id`),
    UNIQUE INDEX `Modul_posttest_id_key`(`posttest_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Materi` (
    `id` VARCHAR(191) NOT NULL,
    `modul_id` VARCHAR(191) NOT NULL,
    `tutor_id` VARCHAR(191) NOT NULL,
    `is_video` BOOLEAN NOT NULL DEFAULT false,
    `video_url` VARCHAR(191) NULL,
    `article` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Submateri` (
    `id` VARCHAR(191) NOT NULL,
    `materi_id` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `konten` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Topik` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `modul_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pretest` (
    `id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Posttest` (
    `id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoalPretest` (
    `id` VARCHAR(191) NOT NULL,
    `pretest_id` VARCHAR(191) NOT NULL,
    `pertanyaan` TEXT NOT NULL,
    `pilihan` JSON NOT NULL,
    `jawaban_benar` VARCHAR(191) NOT NULL,
    `skor` INTEGER NOT NULL DEFAULT 10,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoalPosttest` (
    `id` VARCHAR(191) NOT NULL,
    `posttest_id` VARCHAR(191) NOT NULL,
    `pertanyaan` TEXT NOT NULL,
    `pilihan` JSON NOT NULL,
    `jawaban_benar` VARCHAR(191) NOT NULL,
    `skor` INTEGER NOT NULL DEFAULT 10,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Progress` (
    `id` VARCHAR(191) NOT NULL,
    `siswa_id` VARCHAR(191) NOT NULL,
    `modul_id` VARCHAR(191) NOT NULL,
    `skor_pretest` INTEGER NULL,
    `skor_posttest` INTEGER NULL,
    `nilai_akhir` DOUBLE NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'IN_PROGRESS',
    `is_lulus` BOOLEAN NOT NULL DEFAULT false,
    `last_accessed` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Progress_siswa_id_modul_id_key`(`siswa_id`, `modul_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgressDetail` (
    `id` VARCHAR(191) NOT NULL,
    `siswa_id` VARCHAR(191) NOT NULL,
    `submateri_id` VARCHAR(191) NOT NULL,
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `completed_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certificate` (
    `id` VARCHAR(191) NOT NULL,
    `siswa_id` VARCHAR(191) NOT NULL,
    `modul_id` VARCHAR(191) NOT NULL,
    `kode_sertif` VARCHAR(191) NOT NULL,
    `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `url_sertif` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Certificate_kode_sertif_key`(`kode_sertif`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Modul` ADD CONSTRAINT `Modul_tutor_id_fkey` FOREIGN KEY (`tutor_id`) REFERENCES `Tutor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Modul` ADD CONSTRAINT `Modul_pretest_id_fkey` FOREIGN KEY (`pretest_id`) REFERENCES `Pretest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Modul` ADD CONSTRAINT `Modul_posttest_id_fkey` FOREIGN KEY (`posttest_id`) REFERENCES `Posttest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Materi` ADD CONSTRAINT `Materi_modul_id_fkey` FOREIGN KEY (`modul_id`) REFERENCES `Modul`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Materi` ADD CONSTRAINT `Materi_tutor_id_fkey` FOREIGN KEY (`tutor_id`) REFERENCES `Tutor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submateri` ADD CONSTRAINT `Submateri_materi_id_fkey` FOREIGN KEY (`materi_id`) REFERENCES `Materi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Topik` ADD CONSTRAINT `Topik_modul_id_fkey` FOREIGN KEY (`modul_id`) REFERENCES `Modul`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoalPretest` ADD CONSTRAINT `SoalPretest_pretest_id_fkey` FOREIGN KEY (`pretest_id`) REFERENCES `Pretest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoalPosttest` ADD CONSTRAINT `SoalPosttest_posttest_id_fkey` FOREIGN KEY (`posttest_id`) REFERENCES `Posttest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Progress` ADD CONSTRAINT `Progress_siswa_id_fkey` FOREIGN KEY (`siswa_id`) REFERENCES `siswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Progress` ADD CONSTRAINT `Progress_modul_id_fkey` FOREIGN KEY (`modul_id`) REFERENCES `Modul`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgressDetail` ADD CONSTRAINT `ProgressDetail_submateri_id_fkey` FOREIGN KEY (`submateri_id`) REFERENCES `Submateri`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_siswa_id_fkey` FOREIGN KEY (`siswa_id`) REFERENCES `siswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certificate` ADD CONSTRAINT `Certificate_modul_id_fkey` FOREIGN KEY (`modul_id`) REFERENCES `Modul`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
