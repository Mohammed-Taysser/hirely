-- Backfill missing plan limits for existing plans.
INSERT INTO "PlanLimit" ("planId")
SELECT p."id"
FROM "Plan" p
LEFT JOIN "PlanLimit" pl ON pl."planId" = p."id"
WHERE pl."id" IS NULL;

-- Enforce that each inserted plan has an associated plan limit by transaction end.
CREATE OR REPLACE FUNCTION "enforce_plan_has_limit"()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "PlanLimit" WHERE "planId" = NEW."id") THEN
    RAISE EXCEPTION 'Plan % must have an associated PlanLimit row', NEW."id";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_enforce_plan_has_limit_on_plan" ON "Plan";

CREATE CONSTRAINT TRIGGER "trg_enforce_plan_has_limit_on_plan"
AFTER INSERT ON "Plan"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION "enforce_plan_has_limit"();

-- Prevent deleting plan limits while the parent plan still exists.
CREATE OR REPLACE FUNCTION "prevent_orphan_plan_on_plan_limit_delete"()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Plan" WHERE "id" = OLD."planId") THEN
    RAISE EXCEPTION 'Cannot delete PlanLimit while Plan % still exists', OLD."planId";
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "trg_prevent_orphan_plan_on_plan_limit_delete" ON "PlanLimit";

CREATE CONSTRAINT TRIGGER "trg_prevent_orphan_plan_on_plan_limit_delete"
AFTER DELETE ON "PlanLimit"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION "prevent_orphan_plan_on_plan_limit_delete"();
