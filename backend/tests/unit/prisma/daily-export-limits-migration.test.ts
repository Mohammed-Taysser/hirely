import fs from 'fs';
import path from 'path';

describe('daily export limits migration', () => {
  it('adds dailyExports and dailyExportEmails columns to PlanLimit', () => {
    const migrationPath = path.resolve(
      __dirname,
      '../../../../prisma/migrations/20260214223000_add_daily_export_limits/migration.sql'
    );

    const sql = fs.readFileSync(migrationPath, 'utf8');

    expect(sql).toContain('ALTER TABLE "PlanLimit"');
    expect(sql).toContain('ADD COLUMN "dailyExports" INTEGER NOT NULL DEFAULT 5');
    expect(sql).toContain('ADD COLUMN "dailyExportEmails" INTEGER NOT NULL DEFAULT 20');
  });
});
