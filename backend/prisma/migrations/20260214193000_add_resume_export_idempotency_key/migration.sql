ALTER TABLE "ResumeExport"
ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

CREATE INDEX IF NOT EXISTS "ResumeExport_idempotencyKey_idx"
ON "ResumeExport" ("idempotencyKey");

CREATE UNIQUE INDEX IF NOT EXISTS "ResumeExport_userId_idempotencyKey_key"
ON "ResumeExport" ("userId", "idempotencyKey");
