-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "komentar" TEXT,
    "modulId" TEXT,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_modulId_fkey" FOREIGN KEY ("modulId") REFERENCES "Modul"("id") ON DELETE SET NULL ON UPDATE CASCADE;
