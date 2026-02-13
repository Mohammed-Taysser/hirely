import { auditLogQueryRepository } from '@/apps/container.shared';
import { GetAuditLogsUseCase } from '@/modules/audit/application/use-cases/get-audit-logs/get-audit-logs.use-case';

const getAuditLogsUseCase = new GetAuditLogsUseCase(auditLogQueryRepository);

const auditContainer = {
  getAuditLogsUseCase,
};

export { auditContainer };
