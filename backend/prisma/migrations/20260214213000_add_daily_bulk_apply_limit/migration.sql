-- Add per-feature daily limit for bulk apply operations.
ALTER TABLE "PlanLimit"
ADD COLUMN IF NOT EXISTS "dailyBulkApplies" INTEGER NOT NULL DEFAULT 5;
