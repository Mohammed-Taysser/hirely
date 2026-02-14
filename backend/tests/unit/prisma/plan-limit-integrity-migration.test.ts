import fs from 'node:fs';
import path from 'node:path';

describe('plan limit integrity migration', () => {
  it('includes backfill and integrity triggers', () => {
    const migrationPath = path.join(
      process.cwd(),
      'prisma',
      'migrations',
      '20260214170000_enforce_plan_limit_integrity',
      'migration.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    expect(sql).toContain('INSERT INTO "PlanLimit" ("planId")');
    expect(sql).toContain('LEFT JOIN "PlanLimit" pl ON pl."planId" = p."id"');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION "enforce_plan_has_limit"()');
    expect(sql).toContain('CREATE CONSTRAINT TRIGGER "trg_enforce_plan_has_limit_on_plan"');
    expect(sql).toContain('DEFERRABLE INITIALLY DEFERRED');
    expect(sql).toContain('CREATE OR REPLACE FUNCTION "prevent_orphan_plan_on_plan_limit_delete"()');
    expect(sql).toContain('CREATE CONSTRAINT TRIGGER "trg_prevent_orphan_plan_on_plan_limit_delete"');
  });
});
