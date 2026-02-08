/*
  Warnings:

  - Added the required column `templateId` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "templateId" TEXT NOT NULL,
ADD COLUMN     "templateVersion" TEXT,
ADD COLUMN     "themeConfig" JSONB;

-- AlterTable
ALTER TABLE "ResumeExport" ADD COLUMN     "error" TEXT;
