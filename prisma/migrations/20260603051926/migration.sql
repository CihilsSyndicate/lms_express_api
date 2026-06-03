/*
  Warnings:

  - The values [GURU] on the enum `StudentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StudentType_new" AS ENUM ('SISWA', 'UMUM');
ALTER TABLE "public"."siswa" ALTER COLUMN "studentType" DROP DEFAULT;
ALTER TABLE "siswa" ALTER COLUMN "studentType" TYPE "StudentType_new" USING ("studentType"::text::"StudentType_new");
ALTER TYPE "StudentType" RENAME TO "StudentType_old";
ALTER TYPE "StudentType_new" RENAME TO "StudentType";
DROP TYPE "public"."StudentType_old";
ALTER TABLE "siswa" ALTER COLUMN "studentType" SET DEFAULT 'SISWA';
COMMIT;
