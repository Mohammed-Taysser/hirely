import {
  auditLogService,
  systemLogService,
  userPlanChangeRepository,
} from '@/apps/container.shared';
import { ApplyScheduledPlanChangesUseCase } from '@/modules/user/application/use-cases/apply-scheduled-plan-changes/apply-scheduled-plan-changes.use-case';

const applyScheduledPlanChangesUseCase = new ApplyScheduledPlanChangesUseCase(
  userPlanChangeRepository
);

export { applyScheduledPlanChangesUseCase, auditLogService, systemLogService };
