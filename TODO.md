# TODO (Core: Resume + Export)

## Done
- Resume guardrails (`MAX_RESUME_SECTIONS` + template required section validation).
- Default resume model + set-default endpoint.
- Export reliability core:
  - Billing byte-limit enforcement
  - Production-safe SMTP setup
  - Local/S3 storage driver wiring
- Export operations:
  - Expired export cleanup worker
  - Retry/backoff + retention config
  - Failed export/email visibility endpoints
  - Export ops metrics endpoint
- Plan-limit refinement:
  - Canonical plan limit DTO/policy
  - Centralized limit checks in resume/export/billing
  - Updated plan docs
- Queue payload contract hardening:
  - Shared Zod schemas for PDF and email queue payloads
  - Producer-side validation before enqueue
  - Worker-side validation before executing use cases
  - Unit tests for contract parsing and queue service wiring
- Export enqueue idempotency key support:
  - Optional `idempotencyKey` on `POST /resumes/:resumeId/export`
  - Replay existing export when the same key is retried for the same resume
  - Conflict response when the same key is reused for a different resume
  - Persistence-level uniqueness on (`userId`, `idempotencyKey`)
- Dead-letter requeue support:
  - `POST /api/resumes/exports/:exportId/retry` for failed PDF exports
  - `POST /api/resumes/exports/failed-emails/:jobId/retry` for failed email jobs
  - Guardrails: ownership + status checks + retry rate limiting

## Next (High Value)
1. Add queue metrics split by reason (`free-tier-export` vs `bulk-apply`) for email failures/success.

## Later
- Billing provider integration and cycle-aware downgrade scheduling.
- Per-feature daily limits (e.g., bulk-apply/day) via the canonical plan-limit policy.
