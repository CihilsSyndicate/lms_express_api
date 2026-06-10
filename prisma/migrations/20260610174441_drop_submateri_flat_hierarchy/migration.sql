-- Phase 1: Drop Submateri, flatten hierarchy

-- Step 1: Rename ItemType enum value ARTICLE -> MATERI (PG 10+)
ALTER TYPE "ItemType" RENAME VALUE 'ARTICLE' TO 'MATERI';

-- Step 2: Add new enum value RANGKUMAN_TOPIK
ALTER TYPE "ItemType" ADD VALUE 'RANGKUMAN_TOPIK';

-- Step 3: Add judul column to Materi (backfill with 'Materi' for existing rows)
ALTER TABLE "Materi" ADD COLUMN "judul" TEXT NOT NULL DEFAULT 'Materi';

-- Step 4: Migrate Quiz from materiId FK to topikId FK
-- 4a. Drop existing FK on materiId
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_materiId_fkey";

-- 4b. Add topikId column as nullable initially
ALTER TABLE "Quiz" ADD COLUMN "topikId" TEXT;

-- 4c. Backfill topikId using Materi.topikId
UPDATE "Quiz"
SET "topikId" = "Materi"."topikId"
FROM "Materi"
WHERE "Quiz"."materiId" = "Materi"."id";

-- 4d. Make topikId NOT NULL
ALTER TABLE "Quiz" ALTER COLUMN "topikId" SET NOT NULL;

-- 4e. Drop the old materiId column (FK already dropped in 4a)
ALTER TABLE "Quiz" DROP COLUMN "materiId";

-- 4f. Add new FK to Topik
ALTER TABLE "Quiz"
ADD CONSTRAINT "Quiz_topikId_fkey"
FOREIGN KEY ("topikId") REFERENCES "Topik"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Migrate ProgressDetail from submateriId FK to materiId FK
-- 5a. Drop existing FK on submateriId
ALTER TABLE "ProgressDetail" DROP CONSTRAINT "ProgressDetail_submateriId_fkey";

-- 5b. Add materiId column as nullable initially
ALTER TABLE "ProgressDetail" ADD COLUMN "materiId" TEXT;

-- 5c. Backfill materiId using Submateri.materiId
UPDATE "ProgressDetail"
SET "materiId" = "Submateri"."materiId"
FROM "Submateri"
WHERE "ProgressDetail"."submateriId" = "Submateri"."id";

-- 5d. Make materiId NOT NULL
ALTER TABLE "ProgressDetail" ALTER COLUMN "materiId" SET NOT NULL;

-- 5e. Drop the old submateriId column
ALTER TABLE "ProgressDetail" DROP COLUMN "submateriId";

-- 5f. Add new FK to Materi
ALTER TABLE "ProgressDetail"
ADD CONSTRAINT "ProgressDetail_materiId_fkey"
FOREIGN KEY ("materiId") REFERENCES "Materi"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Drop Submateri table (FK already dropped in 5a)
DROP TABLE "Submateri";
