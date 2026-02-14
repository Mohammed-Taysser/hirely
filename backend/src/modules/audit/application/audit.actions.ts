export const AuditActions = {
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_PLAN_CHANGED: 'user.plan.changed',
  USER_PLAN_SCHEDULED: 'user.plan.scheduled',
  USER_PLAN_APPLIED: 'user.plan.applied',

  PLAN_CREATED: 'plan.created',
  PLAN_UPDATED: 'plan.updated',
  PLAN_DELETED: 'plan.deleted',

  RESUME_CREATED: 'resume.created',
  RESUME_UPDATED: 'resume.updated',
  RESUME_DELETED: 'resume.deleted',
  RESUME_DEFAULT_SET: 'resume.default.set',
  RESUME_DEFAULT_PROMOTED: 'resume.default.promoted',
  RESUME_EXPORT_DOWNLOADED: 'resume.export.downloaded',

  EXPORT_ENQUEUED: 'export.enqueued',
  EXPORT_PROCESSED: 'export.processed',
  EXPORT_FAILED: 'export.failed',
  EXPORT_EMAIL_SENT: 'export.email.sent',
  EXPORT_EMAIL_FAILED: 'export.email.failed',

  BULK_APPLY_ENQUEUED: 'bulk-apply.enqueued',
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];
