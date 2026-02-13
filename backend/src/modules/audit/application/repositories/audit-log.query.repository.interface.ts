import { AuditEntityType } from '@/modules/audit/application/audit.entity';

export interface AuditLogDto {
  id: string;
  action: string;
  actorUserId: string | null;
  entityType: AuditEntityType;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export interface AuditLogListResult {
  logs: AuditLogDto[];
  total: number;
}

export interface IAuditLogQueryRepository {
  findByEntity(input: {
    entityType: AuditEntityType;
    entityId: string;
    page: number;
    limit: number;
  }): Promise<AuditLogListResult>;
}
