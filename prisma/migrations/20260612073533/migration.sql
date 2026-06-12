/*
  Warnings:

  - A unique constraint covering the columns `[siswaId,modulId]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "posttestCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pretestCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "siswa" ADD COLUMN     "push_notification_enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Certificate_siswaId_idx" ON "Certificate"("siswaId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_siswaId_modulId_key" ON "Certificate"("siswaId", "modulId");

-- CreateIndex
CREATE INDEX "Progress_siswaId_idx" ON "Progress"("siswaId");

-- CreateIndex
CREATE INDEX "ProgressDetail_siswaId_idx" ON "ProgressDetail"("siswaId");

-- CreateIndex
CREATE INDEX "ProgressDetail_siswaId_materiId_idx" ON "ProgressDetail"("siswaId", "materiId");

-- CreateIndex
CREATE INDEX "student_answer_log_siswaId_modulId_idx" ON "student_answer_log"("siswaId", "modulId");

-- CreateIndex
CREATE INDEX "student_answer_log_siswaId_questionSource_idx" ON "student_answer_log"("siswaId", "questionSource");
