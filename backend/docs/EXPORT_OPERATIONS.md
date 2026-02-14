# Export Operations (Phase 4)

This document describes the operational export features added in Phase 4.

## 1. Expired Export Cleanup

A dedicated worker removes expired exports from storage and DB.

- Queue: `export-cleanup`
- Worker: `backend/src/jobs/workers/export-cleanup.worker.ts`
- Use case: `CleanupExpiredExportsUseCase`

Behavior:

1. Fetch expired `ResumeExport` records (`status=READY` and `expiresAt <= now`) in batches.
2. In normal mode, delete stored files (local or S3) then delete cleaned records.
3. In dry-run mode, skip all deletes and return what would be deleted.
4. Keep failed deletions for retry in the next run.

Idempotency:

- Local file deletion ignores missing files.
- Cleanup can run repeatedly without corrupting state.

## 2. Retry + Dead-Letter Visibility

Queue retries and retention are now configurable for PDF and email jobs.

- `EXPORT_JOB_ATTEMPTS`
- `EXPORT_JOB_BACKOFF_MS`
- `EXPORT_JOB_KEEP_COMPLETED`
- `EXPORT_JOB_KEEP_FAILED`

These are applied in:

- `BullmqExportQueueService`
- `BullmqExportEmailQueueService`
- `BullmqBulkApplyEmailQueueService`

## 3. Queue Payload Contracts

Queue payloads are validated at enqueue time and worker-consume time.

- Contract file: `backend/src/modules/resume/application/contracts/export-queue.contract.ts`
- PDF payload: `exportId`, `snapshotId`, `userId`
- Email payload: `exportId`, `userId`, `to`, `reason`, `recipient`

This prevents silent drift between producer and worker payload shapes.

## 4. Enqueue Idempotency

`POST /api/resumes/:resumeId/export` accepts an optional `idempotencyKey`.

Behavior:

1. First request with a key creates and enqueues a new export.
2. Retried request with the same key and same `resumeId` reuses the existing export.
3. Reusing the same key for a different `resumeId` returns a conflict.

Persistence:

- `ResumeExport.idempotencyKey` column
- unique constraint on `("userId", "idempotencyKey")`

## 5. Dead-Letter Requeue Endpoints

Failed jobs can be requeued through guarded endpoints:

- `POST /api/resumes/exports/:exportId/retry`
- `POST /api/resumes/exports/failed-emails/:jobId/retry`

Guardrails:

1. User ownership is enforced.
2. Retry operations are rate-limited.
3. Export retry requires current status `FAILED`.
4. Email retry requires export status `READY` and valid failed-job metadata.

## 6. Failed Job Status Endpoints

User-scoped failure visibility endpoints:

- `GET /api/resumes/exports/failed`
- `GET /api/resumes/exports/failed-emails`

Both accept:

- `page`
- `limit`

## 7. Monitoring Counters

Export operations counters endpoint:

- `GET /api/metrics/export-ops?hours=24`

Returns counts for:

- `pdfProcessed`
- `pdfFailed`
- `emailSent`
- `emailFailed`
- `cleanupCompleted`
- `cleanupFailed`

## 8. Failure Alert Thresholds

Automatic failure-ratio alert evaluation runs from the export cleanup worker.

Behavior:

1. Count success/failure events in the configured window.
2. Compute failure ratio per channel (`pdf`, `email`).
3. Trigger alert log when:
  - total events >= `EXPORT_ALERT_MIN_EVENTS`
  - failure ratio >= `EXPORT_ALERT_FAILURE_RATIO`
4. Respect cooldown via `EXPORT_ALERT_COOLDOWN_SECONDS`.

Alert actions:

- `export.pdf.failure.alert.triggered`
- `export.email.failure.alert.triggered`

## 9. Structured Failure Logs

Workers now log structured metadata for troubleshooting, including:

- `jobId`
- `correlationId`
- `exportId`
- `userId`
- `attemptsMade`
- `attemptsStarted`
- `failedReason`
- `stacktrace` (when available)

These logs are written to `SystemLog`.

## 10. New Environment Variables

- `EXPORT_CLEANUP_INTERVAL_SECONDS` (default: `3600`)
- `EXPORT_CLEANUP_BATCH_SIZE` (default: `100`)
- `EXPORT_CLEANUP_DRY_RUN` (default: `false`)
- `EXPORT_ALERT_WINDOW_MINUTES` (default: `60`)
- `EXPORT_ALERT_MIN_EVENTS` (default: `20`)
- `EXPORT_ALERT_FAILURE_RATIO` (default: `0.25`)
- `EXPORT_ALERT_COOLDOWN_SECONDS` (default: `900`)
- `EXPORT_JOB_ATTEMPTS` (default: `3`)
- `EXPORT_JOB_BACKOFF_MS` (default: `10000`)
- `EXPORT_JOB_KEEP_COMPLETED` (default: `1000`)
- `EXPORT_JOB_KEEP_FAILED` (default: `1000`)
