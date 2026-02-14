import fs from 'node:fs';
import path from 'node:path';

describe('daily bulk-apply limit migration', () => {
  it('adds dailyBulkApplies column to PlanLimit', () => {
    const migrationPath = path.join(
      process.cwd(),
      'prisma',
      'migrations',
      '20260214213000_add_daily_bulk_apply_limit',
      'migration.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    expect(sql).toContain('ADD COLUMN IF NOT EXISTS "dailyBulkApplies" INTEGER NOT NULL DEFAULT 5');
  });
});
