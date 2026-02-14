import {
  exportStorage,
  resumeExportRepository,
  systemLogQueryRepository,
  systemLogService,
} from '@/apps/container.shared';
import { CleanupExpiredExportsUseCase } from '@/modules/resume/application/use-cases/cleanup-expired-exports/cleanup-expired-exports.use-case';
import { EvaluateExportFailureAlertsUseCase } from '@/modules/system/application/use-cases/evaluate-export-failure-alerts/evaluate-export-failure-alerts.use-case';

const cleanupExpiredExportsUseCase = new CleanupExpiredExportsUseCase(
  resumeExportRepository,
  exportStorage
);
const evaluateExportFailureAlertsUseCase = new EvaluateExportFailureAlertsUseCase(
  systemLogQueryRepository,
  systemLogService
);

export { cleanupExpiredExportsUseCase, evaluateExportFailureAlertsUseCase, systemLogService };
