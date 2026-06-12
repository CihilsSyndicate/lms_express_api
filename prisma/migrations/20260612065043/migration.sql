-- CreateTable
CREATE TABLE "PosttestSetting" (
    "id" TEXT NOT NULL,
    "posttestId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PosttestSetting_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PosttestSetting" ADD CONSTRAINT "PosttestSetting_posttestId_fkey" FOREIGN KEY ("posttestId") REFERENCES "Posttest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
