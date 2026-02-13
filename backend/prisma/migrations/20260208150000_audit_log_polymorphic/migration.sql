-- Convert AuditLog to polymorphic entity reference
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_userId_fkey";
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_resumeId_fkey";
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_resumeExportId_fkey";
ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_planId_fkey";

ALTER TABLE "AuditLog" ADD COLUMN "entityType" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "entityId" TEXT;

UPDATE "AuditLog" SET "entityType" = 'user', "entityId" = "userId" WHERE "userId" IS NOT NULL;
UPDATE "AuditLog" SET "entityType" = 'resume', "entityId" = "resumeId" WHERE "resumeId" IS NOT NULL;
UPDATE "AuditLog"
SET "entityType" = 'resumeExport', "entityId" = "resumeExportId"
WHERE "resumeExportId" IS NOT NULL;
UPDATE "AuditLog" SET "entityType" = 'plan', "entityId" = "planId" WHERE "planId" IS NOT NULL;

UPDATE "AuditLog"
SET "entityType" = 'user',
    "entityId" = COALESCE("actorUserId", '00000000-0000-0000-0000-000000000000')
WHERE "entityType" IS NULL OR "entityId" IS NULL;

ALTER TABLE "AuditLog" ALTER COLUMN "entityType" SET NOT NULL;
ALTER TABLE "AuditLog" ALTER COLUMN "entityId" SET NOT NULL;

ALTER TABLE "AuditLog" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "AuditLog" DROP COLUMN IF EXISTS "resumeId";
ALTER TABLE "AuditLog" DROP COLUMN IF EXISTS "resumeExportId";
ALTER TABLE "AuditLog" DROP COLUMN IF EXISTS "planId";

ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_entityType_check"
CHECK ("entityType" IN ('user', 'resume', 'resumeExport', 'plan'));

ALTER TABLE "AuditLog"
ADD CONSTRAINT "AuditLog_entityId_uuid_check"
CHECK (
  "entityId" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
);

CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
