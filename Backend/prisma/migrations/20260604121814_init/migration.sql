/*
  Warnings:

  - You are about to drop the column `capacity` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `Event` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `endDate` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Event_date_idx";

-- DropIndex
DROP INDEX "Event_deletedAt_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "capacity",
DROP COLUMN "date",
DROP COLUMN "deletedAt",
DROP COLUMN "isPublished",
DROP COLUMN "venue",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "eventCategory" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "maxGuests" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "rsvpDeadline" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "themeAccent" TEXT,
ADD COLUMN     "venueName" TEXT,
ALTER COLUMN "endDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "fullName" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_updatedAt_idx" ON "Event"("updatedAt");
