import fs from 'node:fs';
import path from 'node:path';

describe('default resume migration', () => {
  it('includes column, backfill, and uniqueness enforcement', () => {
    const migrationPath = path.join(
      process.cwd(),
      'prisma',
      'migrations',
      '20260214100000_add_resume_is_default',
      'migration.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    expect(sql).toContain('ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false');
    expect(sql).toContain('users_without_default');
    expect(sql).toContain('UPDATE "Resume" target');
    expect(sql).toContain('CREATE UNIQUE INDEX IF NOT EXISTS "Resume_userId_default_unique_idx"');
    expect(sql).toContain('WHERE "isDefault" = true');
  });
});
