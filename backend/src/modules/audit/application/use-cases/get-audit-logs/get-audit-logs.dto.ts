import { AuditEntityType } from '@/modules/audit/application/audit.entity';

export interface GetAuditLogsRequestDto {
  entityType: AuditEntityType;
  entityId: string;
  page: number;
  limit: number;
}
