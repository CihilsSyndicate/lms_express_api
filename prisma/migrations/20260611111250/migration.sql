/*
  Warnings:

  - You are about to drop the `Signature` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Signature" DROP CONSTRAINT "Signature_tutorId_fkey";

-- AlterTable
ALTER TABLE "Materi" ALTER COLUMN "judul" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tutor" ADD COLUMN     "signatureUrl" TEXT;

-- DropTable
DROP TABLE "Signature";
