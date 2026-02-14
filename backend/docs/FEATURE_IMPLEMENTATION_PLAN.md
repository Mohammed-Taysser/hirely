# Feature Implementation Plan (Resume + Export Core)

Status as of **February 14, 2026**.

## Execution Order

1. Resume guardrails (`MAX_RESUME_SECTIONS`, deep validation)
2. Default resume model
3. Export reliability core (`billing`, `SMTP`, `S3`)
4. Export operations (`cleanup`, `retry`, monitoring)
5. Plan-limit model refinement and docs

## Delivery Status

### Phase 1: Resume Guardrails

- Status: **Completed**
- Delivered:
  - Section-count enforcement in create/update flow.
  - Template required-section validation.
  - Unit and integration coverage for validation paths.

### Phase 2: Default Resume

- Status: **Completed**
- Delivered:
  - `isDefault` model support and behavior.
  - Auto-default on first resume.
  - Default promotion flow on delete.
  - `PATCH /resumes/:id/default` API.

### Phase 3: Export Reliability Core

- Status: **Completed**
- Delivered:
  - `sizeBytes` tracked on exports.
  - Daily upload byte-limit enforcement.
  - Production SMTP validation/fail-fast behavior.
  - Local/S3 storage driver configuration and wiring.

### Phase 4: Export Operations

- Status: **Completed**
- Delivered:
  - Expired export cleanup use case + scheduled worker.
  - Queue retry/backoff/retention via config.
  - Failed export and failed export-email visibility endpoints.
  - Export operations metrics endpoint.
  - Structured worker failure metadata logs.

### Phase 5: Plan-Limit Refinement

- Status: **Completed**
- Delivered:
  - Canonical `PlanLimitDto` + derived usage limits.
  - Shared plan-limit policy functions.
  - Centralized limit checks in resume/export/billing flows.
  - Finalized `PLAN_CHANGES.md` with concrete examples.

## Quality Gates

Current baseline:

- `npm run arch:check` ✅
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm test -- --runInBand --silent` ✅
- `npm run openapi:lint` ✅

## Next Iteration Candidates

1. Add queue metrics split by reason (`free-tier-export` vs `bulk-apply`) for email success/failure.

## Post-Plan Additions

- Added user-facing plan usage endpoint:
  - `GET /api/users/me/plan-usage`
  - Includes plan limits, current usage, and remaining values.
- Added DB-level plan-limit integrity migration:
  - Backfill missing `PlanLimit` rows
  - Deferred constraint trigger to ensure each new `Plan` has a limit row
  - Deferred constraint trigger preventing orphaned plans after `PlanLimit` delete
- Added export cleanup dry-run mode:
  - `EXPORT_CLEANUP_DRY_RUN=true` computes cleanup impact without deleting files/rows
- Added export failure threshold alerts:
  - configurable window, minimum event count, failure ratio, and cooldown
  - alert actions are written to `SystemLog`
- Added queue payload contract hardening:
  - shared Zod payload schemas for PDF and email queues
  - producer-side validation in BullMQ queue services
  - worker-side validation before invoking use cases
  - unit tests covering schema parsing and enqueue/worker behavior
- Added export enqueue idempotency keys:
  - optional `idempotencyKey` in enqueue export request body
  - DB uniqueness constraint on (`userId`, `idempotencyKey`)
  - same-key retries return existing export for the same resume
  - same-key cross-resume reuse returns conflict
- Added dead-letter requeue endpoints with guardrails:
  - `POST /api/resumes/exports/:exportId/retry`
  - `POST /api/resumes/exports/failed-emails/:jobId/retry`
  - ownership and status checks + retry rate limiting
