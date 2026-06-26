-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "posttestAssignedQuestions" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "pretestAssignedQuestions" TEXT NOT NULL DEFAULT '[]';
