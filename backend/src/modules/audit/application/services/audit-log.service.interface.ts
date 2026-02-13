import { AuditEntityType } from '@/modules/audit/application/audit.entity';

export interface AuditLogInput {
  action: string;
  actorUserId?: string;
  entityType: AuditEntityType;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export interface IAuditLogService {
  log(input: AuditLogInput): Promise<void>;
}
