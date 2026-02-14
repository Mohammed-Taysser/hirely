import fs from 'node:fs';
import path from 'node:path';

describe('resume export idempotency migration', () => {
  it('adds idempotency column and uniqueness/index constraints', () => {
    const migrationPath = path.join(
      process.cwd(),
      'prisma',
      'migrations',
      '20260214193000_add_resume_export_idempotency_key',
      'migration.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    expect(sql).toContain('ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT');
    expect(sql).toContain('CREATE INDEX IF NOT EXISTS "ResumeExport_idempotencyKey_idx"');
    expect(sql).toContain('CREATE UNIQUE INDEX IF NOT EXISTS "ResumeExport_userId_idempotencyKey_key"');
  });
});
