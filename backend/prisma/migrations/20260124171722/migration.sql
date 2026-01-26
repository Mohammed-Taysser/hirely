/*
  Warnings:

  - You are about to drop the column `plan` on the `PlanLimit` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[planId]` on the table `PlanLimit` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,name]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `planId` to the `PlanLimit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_userId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeExport" DROP CONSTRAINT "ResumeExport_snapshotId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeExport" DROP CONSTRAINT "ResumeExport_userId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeSnapshot" DROP CONSTRAINT "ResumeSnapshot_userId_fkey";

-- DropIndex
DROP INDEX "PlanLimit_plan_key";

-- DropIndex
DROP INDEX "User_plan_idx";

-- AlterTable
ALTER TABLE "PlanLimit" DROP COLUMN "plan",
ADD COLUMN     "dailyUploadMb" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "planId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "plan",
ADD COLUMN     "planId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Plan";

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PlanLimit_planId_key" ON "PlanLimit"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_name_key" ON "Resume"("userId", "name");

-- CreateIndex
CREATE INDEX "ResumeSnapshot_createdAt_idx" ON "ResumeSnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "User_planId_idx" ON "User"("planId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSnapshot" ADD CONSTRAINT "ResumeSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSnapshot" ADD CONSTRAINT "ResumeSnapshot_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeExport" ADD CONSTRAINT "ResumeExport_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "ResumeSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeExport" ADD CONSTRAINT "ResumeExport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanLimit" ADD CONSTRAINT "PlanLimit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
