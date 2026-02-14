# Billing-Aware Plan Scheduling

## Overview

Plan changes now support cycle-aware downgrade behavior:

- Explicit `scheduleAt` in `PATCH /users/{userId}/plan` always wins.
- If `scheduleAt` is omitted:
  - upgrades apply immediately
  - downgrades are scheduled at billing cycle end (when configured)

## Configuration

Environment variables:

- `BILLING_PROVIDER`: `mock` | `none`
- `BILLING_CYCLE_DAYS`: cycle length used by the mock provider
- `BILLING_DOWNGRADE_BEHAVIOR`: `cycle_end` | `immediate`
- `BILLING_WEBHOOK_SECRET`: required secret for billing webhook ingestion
- `BILLING_STRIPE_WEBHOOK_SECRET`: optional Stripe-specific secret
- `BILLING_PADDLE_WEBHOOK_SECRET`: optional Paddle-specific secret
- `BILLING_WEBHOOK_TOLERANCE_SECONDS`: max accepted Stripe timestamp skew

## Current Provider Implementations

- `mock`: computes a synthetic cycle end (`now + BILLING_CYCLE_DAYS`)
- `none`: returns immediate cycle boundary (effectively immediate behavior)

## Main Code Paths

- `backend/src/modules/user/application/use-cases/change-user-plan/change-user-plan.use-case.ts`
- `backend/src/modules/billing/infrastructure/services/billing.service.ts`
- `backend/src/modules/billing/infrastructure/services/mock-billing-provider.service.ts`
- `backend/src/modules/billing/application/use-cases/process-billing-webhook/process-billing-webhook.use-case.ts`
- `backend/src/modules/billing/presentation/billing.route.ts`

## Billing Webhook Ingestion

Endpoint:

- `POST /api/billing/webhooks/events`

Signature verification:

- `provider=mock`: `x-billing-webhook-signature` (HMAC-SHA256 hex of raw body)
- `provider=stripe`: `stripe-signature` (timestamped Stripe signature format)
- `provider=paddle`: `paddle-signature` (HMAC-SHA256 hex of raw body)

Supported event types:

- `subscription.renewed`
- `subscription.canceled`
- `subscription.past_due`

Behavior summary:

- `subscription.renewed` + `planCode`: applies plan immediately.
- `subscription.canceled` + `fallbackPlanCode`: applies immediately or schedules for `effectiveAt`.
- `subscription.past_due`: logs event only (no plan mutation).

Replay and idempotency:

- Webhook events are persisted in `BillingWebhookEvent`.
- Unique key on (`provider`, `eventId`) prevents duplicate processing.
- Already processed duplicate events return replayed response without reapplying changes.
