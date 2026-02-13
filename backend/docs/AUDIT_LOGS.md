# Audit Logs

This app records **entity-level audit logs** for major actions (register, plan changes, resume changes, exports).

## Entities Tracked

- `user`
- `resume`
- `resumeExport`
- `plan`

Each audit log row stores a **polymorphic reference** (`entityType`, `entityId`) to the target entity.

## API

`GET /api/audit-logs?entityType=user&entityId=<uuid>&page=1&limit=20`

### Query Params

- `entityType`: `user | resume | resumeExport | plan`
- `entityId`: UUID of the entity
- `page`: number (default `1`)
- `limit`: number (default `10`, max `500`)

### Response

```json
{
  "message": "Audit logs fetched successfully",
  "data": [
    {
      "id": "uuid",
      "action": "resume.created",
      "actorUserId": "uuid",
      "entityType": "resume",
      "entityId": "uuid",
      "metadata": { "templateId": "classic" },
      "createdAt": "2026-02-08T12:30:00.000Z"
    }
  ],
  "metadata": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```

## Actions Logged (Current)

- User: `user.registered`, `user.updated`, `user.deleted`, `user.plan.changed`, `user.plan.scheduled`, `user.plan.applied`
- Plan: `plan.created`, `plan.updated`, `plan.deleted`
- Resume: `resume.created`, `resume.updated`, `resume.deleted`, `resume.export.downloaded`
- Export: `export.enqueued`, `export.processed`, `export.failed`, `export.email.sent`, `export.email.failed`

## Notes

- Delete actions keep logs; `entityType`/`entityId` remain even after the entity is removed.
- `entityType` is restricted to `user | resume | resumeExport | plan`, and `entityId` must be a UUID.
- Audit logs are separate from `SystemLog`, which is used for operational logs and errors.
