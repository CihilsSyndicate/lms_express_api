-- CreateTable
CREATE TABLE "Rangkuman" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "topikId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "konten" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rangkuman_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rangkuman" ADD CONSTRAINT "Rangkuman_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rangkuman" ADD CONSTRAINT "Rangkuman_topikId_fkey" FOREIGN KEY ("topikId") REFERENCES "Topik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
