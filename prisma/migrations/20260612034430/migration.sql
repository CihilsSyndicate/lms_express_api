-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "posttestCorrectCount" INTEGER,
ADD COLUMN     "posttestTimeSpent" INTEGER,
ADD COLUMN     "posttestWrongCount" INTEGER,
ADD COLUMN     "pretestCorrectCount" INTEGER,
ADD COLUMN     "pretestTimeSpent" INTEGER,
ADD COLUMN     "pretestWrongCount" INTEGER;
