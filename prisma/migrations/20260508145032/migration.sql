/*
  Warnings:

  - Added the required column `fullName` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsappNumber` to the `Admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siswa_id` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "profileImg" TEXT,
ADD COLUMN     "username" TEXT NOT NULL,
ADD COLUMN     "whatsappNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Modul" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "siswa_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
