# TODO (Core: Resume + Export)

## Resume
- Enforce `MAX_RESUME_SECTIONS` in create/update flow (config exists, not applied).
- Add a "default resume" flag per user (not implemented).
- Add deeper resume validation rules (structure, required sections per template).

## Export
- Replace placeholder billing enforcement (`BillingService.enforceDailyUploadLimit`).
- Configure real SMTP transport (mailer uses Nodemailer test accounts).
- Wire S3 storage for exports (adapter exists, container uses `LocalStorageAdapter`).
- Add export cleanup job for expired exports (records + files).
- Improve export retry/monitoring (dead-letter handling, visibility into failures).
