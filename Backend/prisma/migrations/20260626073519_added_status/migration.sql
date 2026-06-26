-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "masterTrackUrl" TEXT;

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "faceEncodings" JSONB;

-- CreateTable
CREATE TABLE "VoiceNote" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "voiceUrl" TEXT NOT NULL,
    "instrumentalUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoiceNote_eventId_idx" ON "VoiceNote"("eventId");

-- AddForeignKey
ALTER TABLE "VoiceNote" ADD CONSTRAINT "VoiceNote_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
