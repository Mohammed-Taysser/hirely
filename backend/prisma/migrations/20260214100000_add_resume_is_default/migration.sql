-- Add default-resume support
ALTER TABLE "Resume"
ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- Backfill one default resume per user when missing
WITH users_without_default AS (
  SELECT "userId"
  FROM "Resume"
  GROUP BY "userId"
  HAVING BOOL_OR("isDefault") = false
),
ranked_resumes AS (
  SELECT
    r.id,
    r."userId",
    ROW_NUMBER() OVER (PARTITION BY r."userId" ORDER BY r."createdAt" ASC, r.id ASC) AS rn
  FROM "Resume" r
  INNER JOIN users_without_default uwd ON uwd."userId" = r."userId"
)
UPDATE "Resume" target
SET "isDefault" = true
FROM ranked_resumes ranked
WHERE target.id = ranked.id
  AND ranked.rn = 1;

-- Enforce single default resume per user
CREATE UNIQUE INDEX IF NOT EXISTS "Resume_userId_default_unique_idx"
ON "Resume" ("userId")
WHERE "isDefault" = true;
