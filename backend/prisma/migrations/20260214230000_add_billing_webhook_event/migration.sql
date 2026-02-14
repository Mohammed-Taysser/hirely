-- CreateEnum
CREATE TYPE "BillingWebhookEventStatus" AS ENUM ('PROCESSING', 'PROCESSED', 'IGNORED', 'FAILED');

-- CreateTable
CREATE TABLE "BillingWebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "signature" TEXT,
    "payload" JSONB NOT NULL,
    "status" "BillingWebhookEventStatus" NOT NULL DEFAULT 'PROCESSING',
    "appliedAction" TEXT,
    "error" TEXT,
    "processedAt" TIMESTAMP(3),
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingWebhookEvent_provider_eventId_key" ON "BillingWebhookEvent"("provider", "eventId");

-- CreateIndex
CREATE INDEX "BillingWebhookEvent_status_idx" ON "BillingWebhookEvent"("status");

-- CreateIndex
CREATE INDEX "BillingWebhookEvent_userId_idx" ON "BillingWebhookEvent"("userId");

-- CreateIndex
CREATE INDEX "BillingWebhookEvent_createdAt_idx" ON "BillingWebhookEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "BillingWebhookEvent" ADD CONSTRAINT "BillingWebhookEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
