ALTER TABLE "ResumeExport"
ADD COLUMN IF NOT EXISTS "sizeBytes" INTEGER;

CREATE INDEX IF NOT EXISTS "ResumeExport_userId_createdAt_idx"
ON "ResumeExport" ("userId", "createdAt");
