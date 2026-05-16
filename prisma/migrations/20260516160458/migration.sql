/*
  Warnings:

  - Added the required column `progressPercentage` to the `Progress` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'admin';

-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "progressPercentage" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Topik" ADD COLUMN     "isComputationalThinking" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "siswa" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "QuizScore" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "quizType" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizScore_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizScore" ADD CONSTRAINT "QuizScore_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "Progress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
