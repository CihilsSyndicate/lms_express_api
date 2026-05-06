/*
  Warnings:

  - Added the required column `updatedAt` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ComputationalThinking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Materi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Modul` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Posttest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pretest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SoalPosttest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SoalPretest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Submateri` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Topik` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

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

-- CreateTable
CREATE TABLE "Kuis" (
    "id" TEXT NOT NULL,
    "submateri_id" TEXT NOT NULL,
    "pertanyaan" TEXT NOT NULL,
    "pilihan" JSONB NOT NULL,
    "jawaban_benar" TEXT NOT NULL,
    "skor" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kuis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JawabanKuis" (
    "id" TEXT NOT NULL,
    "kuis_id" TEXT NOT NULL,
    "jawaban" TEXT NOT NULL,
    "is_benar" BOOLEAN NOT NULL,
    "skor" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JawabanKuis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "modul_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "komentar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Kuis" ADD CONSTRAINT "Kuis_submateri_id_fkey" FOREIGN KEY ("submateri_id") REFERENCES "Submateri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JawabanKuis" ADD CONSTRAINT "JawabanKuis_kuis_id_fkey" FOREIGN KEY ("kuis_id") REFERENCES "Kuis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "Modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
