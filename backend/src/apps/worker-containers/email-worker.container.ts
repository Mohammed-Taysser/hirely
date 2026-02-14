import {
  activityService,
  auditLogService,
  exportStorage,
  planLimitQueryRepository,
  resumeExportQueryRepository,
  systemLogService,
  systemLogQueryRepository,
  userQueryRepository,
} from '@/apps/container.shared';
import { SendExportEmailUseCase } from '@/modules/resume/application/use-cases/send-export-email/send-export-email.use-case';
import { ExportEmailService } from '@/modules/resume/infrastructure/services/export-email.service';

const exportEmailService = new ExportEmailService();
const sendExportEmailUseCase = new SendExportEmailUseCase(
  exportEmailService,
  auditLogService,
  planLimitQueryRepository,
  systemLogQueryRepository,
  resumeExportQueryRepository,
  userQueryRepository,
  exportStorage,
  activityService
);

export { sendExportEmailUseCase, systemLogService };
