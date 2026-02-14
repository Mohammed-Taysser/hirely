import fs from 'fs';
import path from 'path';

describe('billing webhook event migration', () => {
  it('creates BillingWebhookEvent table and status enum', () => {
    const migrationPath = path.resolve(
      __dirname,
      '../../../../prisma/migrations/20260214230000_add_billing_webhook_event/migration.sql'
    );

    const sql = fs.readFileSync(migrationPath, 'utf8');

    expect(sql).toContain('CREATE TYPE "BillingWebhookEventStatus" AS ENUM');
    expect(sql).toContain('CREATE TABLE "BillingWebhookEvent"');
    expect(sql).toContain('"status" "BillingWebhookEventStatus" NOT NULL DEFAULT \'PROCESSING\'');
    expect(sql).toContain(
      'CREATE UNIQUE INDEX "BillingWebhookEvent_provider_eventId_key" ON "BillingWebhookEvent"("provider", "eventId")'
    );
  });
});
