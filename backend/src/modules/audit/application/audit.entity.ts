export const AUDIT_ENTITY_TYPES = ['user', 'resume', 'resumeExport', 'plan'] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export const buildAuditEntity = (entityType: AuditEntityType, entityId: string) => ({
  entityType,
  entityId,
});
