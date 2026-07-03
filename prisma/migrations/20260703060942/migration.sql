/*
  Warnings:

  - You are about to drop the `SoalPosttest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SoalPosttest" DROP CONSTRAINT "SoalPosttest_posttestId_fkey";

-- AlterTable
ALTER TABLE "Posttest" ADD COLUMN     "posttestName" TEXT;

-- DropTable
DROP TABLE "SoalPosttest";
