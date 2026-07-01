-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "quizGroupId" TEXT;

-- CreateTable
CREATE TABLE "QuizGroup" (
    "id" TEXT NOT NULL,
    "topikId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "quizType" "QuizType" NOT NULL DEFAULT 'REGULER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_quizGroupId_fkey" FOREIGN KEY ("quizGroupId") REFERENCES "QuizGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizGroup" ADD CONSTRAINT "QuizGroup_topikId_fkey" FOREIGN KEY ("topikId") REFERENCES "Topik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
