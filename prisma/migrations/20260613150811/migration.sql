-- DropForeignKey
ALTER TABLE "Modul" DROP CONSTRAINT "Modul_posttestId_fkey";

-- DropForeignKey
ALTER TABLE "Modul" DROP CONSTRAINT "Modul_pretestId_fkey";

-- AlterTable
ALTER TABLE "SoalPosttest" ADD COLUMN     "ctAspect" TEXT,
ADD COLUMN     "ctGroupId" TEXT,
ADD COLUMN     "ctStory" TEXT;

-- AlterTable
ALTER TABLE "SoalPretest" ADD COLUMN     "ctAspect" TEXT,
ADD COLUMN     "ctGroupId" TEXT,
ADD COLUMN     "ctStory" TEXT;

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_pretestId_fkey" FOREIGN KEY ("pretestId") REFERENCES "Pretest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modul" ADD CONSTRAINT "Modul_posttestId_fkey" FOREIGN KEY ("posttestId") REFERENCES "Posttest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
