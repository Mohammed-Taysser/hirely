-- Create SystemLog table
CREATE TABLE "SystemLog" (
  "id" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "message" TEXT,
  "metadata" JSONB,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SystemLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SystemLog"
ADD CONSTRAINT "SystemLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "SystemLog_userId_idx" ON "SystemLog"("userId");
CREATE INDEX "SystemLog_action_idx" ON "SystemLog"("action");
CREATE INDEX "SystemLog_level_idx" ON "SystemLog"("level");
CREATE INDEX "SystemLog_createdAt_idx" ON "SystemLog"("createdAt");
