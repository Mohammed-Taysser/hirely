# Feature Implementation Plan (Resume + Export Core)

## Execution Order

1. Resume guardrails (`MAX_RESUME_SECTIONS`, deep validation)
2. Default resume model
3. Export reliability core (`billing`, `SMTP`, `S3`)
4. Export operations (`cleanup`, `retry`, monitoring)
5. Plan-limit model refinement and docs

## Phase 1: Resume Guardrails

1. Enforce `MAX_RESUME_SECTIONS` in create/update
- Add a policy/rule in resume application/domain for section count.
- Apply in:
  - `backend/src/modules/resume/application/use-cases/create-resume/create-resume.use-case.ts`
  - `backend/src/modules/resume/application/use-cases/update-resume/update-resume.use-case.ts`
- Return `400` with clear error message.
- Add unit + integration tests for valid/invalid cases.

2. Deep resume validation (structure + required sections by template)
- Add validator contract in `resume/application/services`.
- Implement validator in `resume/infrastructure/services`.
- Validate by template id (using `@hirely/resume-templates` rules).
- Execute validation before persistence in create/update use-cases.
- Add tests per template rule matrix.

## Phase 2: Default Resume

1. Data model
- Prisma migration: add `isDefault Boolean @default(false)` to `Resume`.
- Add partial unique index: one default resume per user.
- Backfill existing data (set one default when missing).

2. Application behavior
- First resume for a user becomes default automatically.
- Deleting default resume auto-promotes another resume (if available).
- Add `SetDefaultResumeUseCase`.
- Include `isDefault` in query DTOs.

3. API + docs
- Add endpoint: `PATCH /resumes/:id/default`.
- Update `backend/docs/swagger.yaml`.

4. Tests
- Migration/backfill correctness tests.
- API and use-case tests for default behavior.

## Phase 3: Export Reliability Core

1. Billing enforcement
- Replace placeholder in `backend/src/modules/billing/infrastructure/services/billing.service.ts`.
- Add `sizeBytes` to `ResumeExport` (migration).
- Enforce daily upload bytes per plan.
- Integrate check in export completion flow.

2. SMTP production transport
- Require SMTP config in production (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`).
- Fail fast for invalid production SMTP config.
- Keep safe non-production fallback.

3. S3 export storage
- Add/confirm S3 storage implementation in resume infrastructure.
- Add config switch `EXPORT_STORAGE_DRIVER=local|s3`.
- Wire in `backend/src/apps/container.shared.ts`.
- Keep local as default for dev/test.

4. Tests
- Billing path tests.
- Storage contract tests (local + s3 mock).
- SMTP service tests with mocked transport.

## Phase 4: Export Operations

1. Expired export cleanup
- Add cleanup use-case/worker to remove expired records + files.
- Schedule via worker loop with configurable interval.
- Ensure idempotency.

2. Retry and dead-letter visibility
- Configure queue retry/backoff options.
- Retain failure metadata for troubleshooting.
- Add status endpoints/use-cases for failed export/email jobs.
- Add structured failure logs (jobId, exportId, userId, reason).

3. Monitoring
- Add counters for export/email success/failure and cleanup results.
- Add logs with stable action names and correlation IDs.
- Optional: expose basic metrics endpoint.

## Phase 5: Plan-Limit Refinement

1. Clarify limit model
- Define one canonical `PlanLimit` structure per plan.
- Remove ambiguous/duplicated limit logic.

2. Centralize limit reads
- Ensure all resume/export limits go through one application policy/repository path.

3. Docs
- Update `backend/docs/PLAN_CHANGES.md` with final limit model and examples.

## Cross-Cutting Requirements

1. DDD boundaries
- Keep domain logic in domain/application policies.
- Keep infra-specific integration in infrastructure.
- Keep controllers thin.

2. Quality gates
- Must pass:
  - `npm run arch:check`
  - `npm run lint`
  - `npm run typecheck`
  - `npm test` (targeted or full)

## Recommended PR Breakdown

1. PR-1: `MAX_RESUME_SECTIONS` + deep validation
2. PR-2: default resume migration + endpoint
3. PR-3: billing enforcement + export `sizeBytes`
4. PR-4: SMTP production setup
5. PR-5: S3 storage driver wiring
6. PR-6: expired export cleanup worker
7. PR-7: retry/dead-letter/monitoring endpoints
8. PR-8: plan-limit refinement + docs
