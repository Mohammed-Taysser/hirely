# Export Operations (Phase 4)

This document describes the operational export features added in Phase 4.

## 1. Expired Export Cleanup

A dedicated worker removes expired exports from storage and DB.

- Queue: `export-cleanup`
- Worker: `backend/src/jobs/workers/export-cleanup.worker.ts`
- Use case: `CleanupExpiredExportsUseCase`

Behavior:

1. Fetch expired `ResumeExport` records (`status=READY` and `expiresAt <= now`) in batches.
2. Delete stored files (local or S3).
3. Delete successfully cleaned export records.
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

## 3. Failed Job Status Endpoints

User-scoped failure visibility endpoints:

- `GET /api/resumes/exports/failed`
- `GET /api/resumes/exports/failed-emails`

Both accept:

- `page`
- `limit`

## 4. Monitoring Counters

Export operations counters endpoint:

- `GET /api/metrics/export-ops?hours=24`

Returns counts for:

- `pdfProcessed`
- `pdfFailed`
- `emailSent`
- `emailFailed`
- `cleanupCompleted`
- `cleanupFailed`

## 5. Structured Failure Logs

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

## 6. New Environment Variables

- `EXPORT_CLEANUP_INTERVAL_SECONDS` (default: `3600`)
- `EXPORT_CLEANUP_BATCH_SIZE` (default: `100`)
- `EXPORT_JOB_ATTEMPTS` (default: `3`)
- `EXPORT_JOB_BACKOFF_MS` (default: `10000`)
- `EXPORT_JOB_KEEP_COMPLETED` (default: `1000`)
- `EXPORT_JOB_KEEP_FAILED` (default: `1000`)
