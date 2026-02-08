-- Add scheduled plan change fields
ALTER TABLE "User" ADD COLUMN "pendingPlanId" TEXT;
ALTER TABLE "User" ADD COLUMN "pendingPlanAt" TIMESTAMP(3);

CREATE INDEX "User_pendingPlanId_idx" ON "User"("pendingPlanId");
CREATE INDEX "User_pendingPlanAt_idx" ON "User"("pendingPlanAt");
