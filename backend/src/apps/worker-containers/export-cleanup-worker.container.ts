import { exportStorage, resumeExportRepository, systemLogService } from '@/apps/container.shared';
import { CleanupExpiredExportsUseCase } from '@/modules/resume/application/use-cases/cleanup-expired-exports/cleanup-expired-exports.use-case';

const cleanupExpiredExportsUseCase = new CleanupExpiredExportsUseCase(
  resumeExportRepository,
  exportStorage
);

export { cleanupExpiredExportsUseCase, systemLogService };
