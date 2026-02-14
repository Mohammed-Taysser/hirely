# Plan Changes And Limit Model

## Scope

This document covers:

- User plan upgrade/downgrade behavior
- Canonical plan-limit model used by resume/export/billing enforcement

## 1. User Plan Change Behavior (Current)

Endpoint:

- `PATCH /users/:userId/plan`

Request:

```json
{
  "planCode": "PRO",
  "scheduleAt": "2026-02-10T12:00:00.000Z"
}
```

Rules:

- Plan change is immediate when `scheduleAt` is omitted.
- Exception: if omitted and the request is a downgrade, it is auto-scheduled for billing cycle end.
- If `scheduleAt` is in the future, change is stored as `pendingPlanId` + `pendingPlanAt`.
- Scheduled changes are applied by worker loop every `PLAN_CHANGE_INTERVAL_SECONDS`.
- User can only change their own plan.

## 2. Canonical Plan Limit Model (Phase 5)

Each plan has one canonical limit row in `PlanLimit`:

- `maxResumes`
- `maxExports`
- `dailyUploadMb`
- `dailyExports`
- `dailyExportEmails`
- `dailyBulkApplies`

Canonical DTO:

- `backend/src/modules/plan/application/dto/plan-limit.dto.ts`

Canonical policy (single comparison logic path):

- `backend/src/modules/plan/application/policies/plan-limit.policy.ts`

Key policy functions:

- `requirePlanUsageLimits(...)`
- `hasReachedResumeLimit(...)`
- `hasReachedExportLimit(...)`
- `exceedsDailyUploadLimit(...)`
- `hasReachedDailyBulkApplyLimit(...)`
- `hasReachedDailyExportLimit(...)`
- `hasReachedDailyExportEmailLimit(...)`
- `classifyPlanChangeDirection(...)`

## 3. Centralized Enforcement Paths

All resume/export limit checks now go through `plan-limit.policy` and `IPlanLimitQueryRepository`.

Resume create:

- `CreateResumeUseCase`:
  - reads plan limits via `findByPlanId`
  - uses `hasReachedResumeLimit`

Export count limit:

- `ExportService.enforceExportLimit`:
  - reads plan limits via `findByPlanId`
  - uses `hasReachedExportLimit`

Daily upload byte limit:

- `BillingService.enforceDailyUploadLimit`:
  - reads plan limits via `findByPlanId`
  - reads used bytes via `IResumeExportRepository.getUploadedBytesByUserInRange`
  - uses `exceedsDailyUploadLimit`

Daily bulk-apply limit:

- `BulkApplyUseCase`:
  - reads plan limits via `findByPlanId`
  - reads current UTC day usage from `SystemLog` action count
  - uses `hasReachedDailyBulkApplyLimit`

Daily export count limit:

- `ExportService.enforceExportLimit`:
  - reads plan limits via `findByPlanId`
  - counts exports created in current UTC day
  - uses `hasReachedDailyExportLimit`

Daily export email limit:

- `SendExportEmailUseCase`:
  - reads plan limits via `findByPlanId`
  - counts sent emails in current UTC day via `SystemLog` action count
  - uses `hasReachedDailyExportEmailLimit`

## 4. User Plan Usage Endpoint

Endpoint:

- `GET /api/users/me/plan-usage`

Response includes:

- Plan identity (`id`, `code`, `name`)
- Limits (`maxResumes`, `maxExports`, `dailyUploadMb`, `dailyUploadBytes`)
- Current usage (`resumesUsed`, `exportsUsed`, `dailyUploadUsedBytes`, `dailyBulkAppliesUsed`)
- Remaining capacity (`resumes`, `exports`, `dailyUploadBytes`, `dailyBulkApplies`)

## 5. Practical Examples

Example A: resume creation

- Plan limits: `maxResumes=3`
- Current resumes: `3`
- Result: blocked (`Resume limit reached for your plan`)

Example B: export creation

- Plan limits: `maxExports=10`
- Current exports: `9`
- Result: allowed

Example C: daily upload bytes

- Plan limits: `dailyUploadMb=5` (5,242,880 bytes)
- Used today: 4,900,000 bytes
- New export size: 500,000 bytes
- Result: blocked (`Daily upload limit reached for your plan`)

## 6. Implementation Notes

Main files:

- `backend/src/modules/plan/application/dto/plan-limit.dto.ts`
- `backend/src/modules/plan/application/policies/plan-limit.policy.ts`
- `backend/src/modules/plan/application/repositories/plan-limit.query.repository.interface.ts`
- `backend/prisma/migrations/20260214170000_enforce_plan_limit_integrity/migration.sql`
- `backend/src/modules/resume/application/use-cases/create-resume/create-resume.use-case.ts`
- `backend/src/modules/resume/application/services/export.service.ts`
- `backend/src/modules/billing/infrastructure/services/billing.service.ts`
- `backend/src/modules/user/application/use-cases/get-user-plan-usage/get-user-plan-usage.use-case.ts`
- `backend/src/modules/resume/application/use-cases/bulk-apply/bulk-apply.use-case.ts`
- `backend/src/modules/billing/infrastructure/services/mock-billing-provider.service.ts`

## 7. Future Enhancements

- Add more per-feature daily limits (for example: export/day and email/day).

## 8. Export Enqueue Idempotency (New)

Endpoint:

- `POST /api/resumes/:resumeId/export`

Optional request body field:

- `idempotencyKey` (`string`, 8-128 chars)

Rules:

- Same user + same key + same resume: return existing export (`replay`), do not enqueue a new job.
- Same user + same key + different resume: conflict.
- Enforced by DB uniqueness on `ResumeExport(userId, idempotencyKey)`.

## 9. Dead-Letter Requeue (New)

Endpoints:

- `POST /api/resumes/exports/:exportId/retry`
- `POST /api/resumes/exports/failed-emails/:jobId/retry`

Rules:

- Retry export: only allowed when export is in `FAILED` status.
- Retry failed email: failed log must belong to user and include valid payload metadata.
- Retry failed email requires export status `READY`.
- Both endpoints are rate-limited.

## 10. Billing Webhook Ingestion (New)

Endpoint:

- `POST /api/billing/webhooks/events`

Security:

- Requires provider-specific webhook signature headers.
- Signatures are validated from raw request body.
- Duplicate events are replay-safe using persisted billing webhook event records.

Supported events:

- `subscription.renewed`
- `subscription.canceled`
- `subscription.past_due`

Behavior:

- Renewal can apply plan immediately when `planCode` is supplied.
- Cancellation can apply/schedule fallback plan when `fallbackPlanCode` is supplied.
- Past-due currently records logs without mutating plan.
