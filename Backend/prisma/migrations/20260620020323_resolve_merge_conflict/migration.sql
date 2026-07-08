-- CreateEnum
CREATE TYPE "AIProcessingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "aiStatus" "AIProcessingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "capturedAt" TIMESTAMP(3),
ADD COLUMN     "clutchName" TEXT,
ADD COLUMN     "pHash" TEXT,
ADD COLUMN     "rejectionReason" TEXT;

-- CreateTable
CREATE TABLE "GuestFace" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "boundingBox" JSONB,
    "mediaId" TEXT NOT NULL,

    CONSTRAINT "GuestFace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuestFace_guestId_idx" ON "GuestFace"("guestId");

-- CreateIndex
CREATE INDEX "Media_eventId_pHash_idx" ON "Media"("eventId", "pHash");

-- CreateIndex
CREATE INDEX "Media_eventId_clutchName_idx" ON "Media"("eventId", "clutchName");

-- AddForeignKey
ALTER TABLE "GuestFace" ADD CONSTRAINT "GuestFace_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestFace" ADD CONSTRAINT "GuestFace_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
