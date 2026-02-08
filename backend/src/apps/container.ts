import { LoginUseCase } from '@/modules/auth/application/use-cases/login/login.use-case';
import { RefreshTokenUseCase } from '@/modules/auth/application/use-cases/refresh-token/refresh-token.use-case';
import { RegisterUserUseCase as RegisterAuthUserUseCase } from '@/modules/auth/application/use-cases/register-user/register-user.use-case';
import { SwitchUserUseCase } from '@/modules/auth/application/use-cases/switch-user/switch-user.use-case';
import { BulkApplyUseCase } from '@/modules/apply/application/use-cases/bulk-apply/bulk-apply.use-case';
import { GetExportStatusUseCase } from '@/modules/export/application/use-cases/get-export-status/get-export-status.use-case';
import { CreatePlanUseCase } from '@/modules/plan/application/use-cases/create-plan/create-plan.use-case';
import { DeletePlanUseCase } from '@/modules/plan/application/use-cases/delete-plan/delete-plan.use-case';
import { GetPlanByIdUseCase } from '@/modules/plan/application/use-cases/get-plan-by-id/get-plan-by-id.use-case';
import { GetPlansUseCase } from '@/modules/plan/application/use-cases/get-plans/get-plans.use-case';
import { UpdatePlanUseCase } from '@/modules/plan/application/use-cases/update-plan/update-plan.use-case';
import { CreateResumeUseCase } from '@/modules/resume/application/use-cases/create-resume/create-resume.use-case';
import { DeleteResumeUseCase } from '@/modules/resume/application/use-cases/delete-resume/delete-resume.use-case';
import { EnqueueResumeExportUseCase } from '@/modules/resume/application/use-cases/enqueue-resume-export/enqueue-resume-export.use-case';
import { ExportResumeUseCase } from '@/modules/resume/application/use-cases/export-resume/export-resume.use-case';
import { GetResumeByIdQueryUseCase } from '@/modules/resume/application/use-cases/get-resume-by-id-query/get-resume-by-id-query.use-case';
import { GetResumeExportStatusUseCase } from '@/modules/resume/application/use-cases/get-resume-export-status/get-resume-export-status.use-case';
import { GetResumeExportsUseCase } from '@/modules/resume/application/use-cases/get-resume-exports/get-resume-exports.use-case';
import { GetResumeSnapshotsUseCase } from '@/modules/resume/application/use-cases/get-resume-snapshots/get-resume-snapshots.use-case';
import { GetResumesListUseCase } from '@/modules/resume/application/use-cases/get-resumes-list/get-resumes-list.use-case';
import { GetResumesUseCase } from '@/modules/resume/application/use-cases/get-resumes/get-resumes.use-case';
import { UpdateResumeUseCase } from '@/modules/resume/application/use-cases/update-resume/update-resume.use-case';
import { GetResumeTemplatesUseCase } from '@/modules/resumeTemplate/application/use-cases/get-resume-templates/get-resume-templates.use-case';
import { ResumeTemplateService } from '@/modules/resumeTemplate/infrastructure/services/resume-template.service';
import { RedisRateLimiter } from '@/modules/shared/infra/rate-limiter/redis-rate-limiter.service';
import { GetHealthCheckUseCase } from '@/modules/system/application/use-cases/get-health-check/get-health-check.use-case';

import { BullmqExportQueueService } from '@/modules/export/infrastructure/services/bullmq-export-queue.service';
import { BullmqExportEmailQueueService } from '@/modules/export/infrastructure/services/bullmq-export-email-queue.service';
import { ExportStatusService } from '@/modules/export/infrastructure/services/export-status.service';
import { ExportService } from '@/modules/export/infrastructure/services/export.service';
import { BullmqBulkApplyEmailQueueService } from '@/modules/apply/infrastructure/services/bullmq-bulk-apply-email-queue.service';
import { ApplyService } from '@/modules/apply/infrastructure/services/apply.service';
import { PrismaPlanLimitQueryRepository } from '@/modules/plan/infrastructure/persistence/prisma-plan-limit.query.repository';
import { PrismaPlanCommandRepository } from '@/modules/plan/infrastructure/persistence/prisma-plan.command.repository';
import { PrismaPlanQueryRepository } from '@/modules/plan/infrastructure/persistence/prisma-plan.query.repository';
import { PrismaResumeExportQueryRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume-export.query.repository';
import { PrismaResumeSnapshotRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume-snapshot.repository';
import { PrismaResumeQueryRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume.query.repository';
import { PrismaResumeRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume.repository';
import { ResumeExportService } from '@/modules/resume/infrastructure/services/resume-export.service';
import passwordHasherService from '@/modules/shared/services/password-hasher.service';
import tokenService from '@/modules/shared/services/token.service';
import { OsSystemHealthService } from '@/modules/system/infrastructure/services/os-system-health.service';
import { LocalStorageAdapter } from '@/infra/storage/local.adapter';
import { BillingService } from '@/modules/billing/infrastructure/services/billing.service';
import { ActivityService } from '@/modules/activity/infrastructure/services/activity.service';
import { DeleteUserUseCase } from '@/modules/user/application/use-cases/delete-user/delete-user.use-case';
import { GetUserByIdQueryUseCase } from '@/modules/user/application/use-cases/get-user-by-id-query/get-user-by-id-query.use-case';
import { GetUsersListUseCase } from '@/modules/user/application/use-cases/get-users-list/get-users-list.use-case';
import { GetUsersUseCase } from '@/modules/user/application/use-cases/get-users/get-users.use-case';
import { CreateUserWithPlanUseCase } from '@/modules/user/application/use-cases/create-user-with-plan/create-user-with-plan.use-case';
import { ChangeUserPlanUseCase } from '@/modules/user/application/use-cases/change-user-plan/change-user-plan.use-case';
import { RegisterUserUseCase } from '@/modules/user/application/use-cases/register-user/register-user.use-case';
import { UpdateUserUseCase } from '@/modules/user/application/use-cases/update-user/update-user.use-case';
import { PrismaUserQueryRepository } from '@/modules/user/infrastructure/persistence/prisma-user.query.repository';
import { PrismaUserRepository } from '@/modules/user/infrastructure/persistence/prisma-user.repository';
import { RATE_LIMITS } from '@/apps/constant';

const userRepository = new PrismaUserRepository();
const userQueryRepository = new PrismaUserQueryRepository();
const planQueryRepository = new PrismaPlanQueryRepository();
const planCommandRepository = new PrismaPlanCommandRepository();
const planLimitQueryRepository = new PrismaPlanLimitQueryRepository();
const resumeRepository = new PrismaResumeRepository();
const resumeQueryRepository = new PrismaResumeQueryRepository();
const resumeSnapshotRepository = new PrismaResumeSnapshotRepository();
const resumeExportQueryRepository = new PrismaResumeExportQueryRepository();
const exportStorage = new LocalStorageAdapter();
const exportEmailQueueService = new BullmqExportEmailQueueService();
const billingService = new BillingService();
const activityService = new ActivityService();
const exportService = new ExportService(
  resumeSnapshotRepository,
  exportStorage,
  exportEmailQueueService,
  billingService,
  activityService
);
const exportQueueService = new BullmqExportQueueService();
const rateLimiter = new RedisRateLimiter();
const applyService = new ApplyService();
const bulkApplyEmailQueueService = new BullmqBulkApplyEmailQueueService();
const resumeExportService = new ResumeExportService(exportService);
const exportStatusService = new ExportStatusService(exportService);
const resumeTemplateService = new ResumeTemplateService();
const systemHealthService = new OsSystemHealthService();

const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasherService);
const createUserWithPlanUseCase = new CreateUserWithPlanUseCase(
  planQueryRepository,
  registerUserUseCase,
  userQueryRepository
);
const registerAuthUserUseCase = new RegisterAuthUserUseCase(
  createUserWithPlanUseCase,
  tokenService
);
const loginUseCase = new LoginUseCase(
  userRepository,
  tokenService,
  passwordHasherService,
  userQueryRepository
);
const refreshTokenUseCase = new RefreshTokenUseCase(tokenService);
const switchUserUseCase = new SwitchUserUseCase(userRepository, userQueryRepository, tokenService);
const getUsersUseCase = new GetUsersUseCase(userQueryRepository);
const getUsersListUseCase = new GetUsersListUseCase(userQueryRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository, userQueryRepository);
const deleteUserUseCase = new DeleteUserUseCase(userRepository, userQueryRepository);
const changeUserPlanUseCase = new ChangeUserPlanUseCase(
  userRepository,
  userQueryRepository,
  planQueryRepository
);
const getUserByIdQueryUseCase = new GetUserByIdQueryUseCase(userQueryRepository);

const getPlansUseCase = new GetPlansUseCase(planQueryRepository);
const getPlanByIdUseCase = new GetPlanByIdUseCase(planQueryRepository);
const createPlanUseCase = new CreatePlanUseCase(planCommandRepository, planQueryRepository);
const updatePlanUseCase = new UpdatePlanUseCase(planCommandRepository, planQueryRepository);
const deletePlanUseCase = new DeletePlanUseCase(planCommandRepository, planQueryRepository);

const createResumeUseCase = new CreateResumeUseCase(
  resumeRepository,
  planLimitQueryRepository,
  resumeQueryRepository
);
const updateResumeUseCase = new UpdateResumeUseCase(
  resumeRepository,
  resumeSnapshotRepository,
  resumeQueryRepository
);
const deleteResumeUseCase = new DeleteResumeUseCase(resumeRepository, resumeQueryRepository);
const exportResumeUseCase = new ExportResumeUseCase(resumeExportService);
const getResumeByIdQueryUseCase = new GetResumeByIdQueryUseCase(resumeQueryRepository);
const getResumeExportsUseCase = new GetResumeExportsUseCase(resumeExportQueryRepository);
const getResumeExportStatusUseCase = new GetResumeExportStatusUseCase(resumeExportService);
const enqueueResumeExportUseCase = new EnqueueResumeExportUseCase(
  exportService,
  exportQueueService,
  resumeSnapshotRepository,
  userQueryRepository,
  rateLimiter
);
const getResumesUseCase = new GetResumesUseCase(resumeQueryRepository);
const getResumesListUseCase = new GetResumesListUseCase(resumeQueryRepository);
const getResumeSnapshotsUseCase = new GetResumeSnapshotsUseCase(resumeQueryRepository);

const getExportStatusUseCase = new GetExportStatusUseCase(exportStatusService);

const getResumeTemplatesUseCase = new GetResumeTemplatesUseCase(resumeTemplateService);
const getHealthCheckUseCase = new GetHealthCheckUseCase(systemHealthService);

const bulkApplyUseCase = new BulkApplyUseCase(
  applyService,
  exportService,
  exportQueueService,
  resumeSnapshotRepository,
  userQueryRepository,
  rateLimiter,
  bulkApplyEmailQueueService,
  RATE_LIMITS.BULK_APPLY
);

const authContainer = {
  registerUserUseCase: registerAuthUserUseCase,
  loginUseCase,
  refreshTokenUseCase,
  switchUserUseCase,
};

const userContainer = {
  getUsersUseCase,
  getUsersListUseCase,
  updateUserUseCase,
  deleteUserUseCase,
  changeUserPlanUseCase,
  getUserByIdQueryUseCase,
  createUserWithPlanUseCase,
};

const planContainer = {
  getPlansUseCase,
  getPlanByIdUseCase,
  createPlanUseCase,
  updatePlanUseCase,
  deletePlanUseCase,
};

const resumeContainer = {
  getResumesUseCase,
  getResumesListUseCase,
  getResumeByIdQueryUseCase,
  getResumeSnapshotsUseCase,
  getResumeExportsUseCase,
  getResumeExportStatusUseCase,
  exportResumeUseCase,
  enqueueResumeExportUseCase,
  createResumeUseCase,
  updateResumeUseCase,
  deleteResumeUseCase,
};

const exportContainer = {
  getExportStatusUseCase,
};

const resumeTemplateContainer = {
  getResumeTemplatesUseCase,
};

const systemContainer = {
  getHealthCheckUseCase,
};

const applyContainer = {
  bulkApplyUseCase,
};

export {
  authContainer,
  exportContainer,
  applyContainer,
  planContainer,
  resumeContainer,
  resumeTemplateContainer,
  systemContainer,
  userContainer,
};
