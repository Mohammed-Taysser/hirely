import CONFIG from '@/apps/config';
import { ActivityService } from '@/modules/activity/infrastructure/services/activity.service';
import { PrismaAuditLogQueryRepository } from '@/modules/audit/infrastructure/persistence/prisma-audit-log.query.repository';
import { PrismaAuditLogService } from '@/modules/audit/infrastructure/services/prisma-audit-log.service';
import { BillingService } from '@/modules/billing/infrastructure/services/billing.service';
import { PrismaPlanLimitQueryRepository } from '@/modules/plan/infrastructure/persistence/prisma-plan-limit.query.repository';
import { PrismaPlanCommandRepository } from '@/modules/plan/infrastructure/persistence/prisma-plan.command.repository';
import { PrismaPlanQueryRepository } from '@/modules/plan/infrastructure/persistence/prisma-plan.query.repository';
import { ExportService } from '@/modules/resume/application/services/export.service';
import { PrismaResumeExportQueryRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume-export.query.repository';
import { PrismaResumeExportRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume-export.repository';
import { PrismaResumeSnapshotQueryRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume-snapshot.query.repository';
import { PrismaResumeSnapshotRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume-snapshot.repository';
import { PrismaResumeQueryRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume.query.repository';
import { PrismaResumeRepository } from '@/modules/resume/infrastructure/persistence/prisma-resume.repository';
import { BullmqBulkApplyEmailQueueService } from '@/modules/resume/infrastructure/services/bullmq-bulk-apply-email-queue.service';
import { BullmqExportEmailQueueService } from '@/modules/resume/infrastructure/services/bullmq-export-email-queue.service';
import { BullmqExportQueueService } from '@/modules/resume/infrastructure/services/bullmq-export-queue.service';
import { GotenbergPdfRenderer } from '@/modules/resume/infrastructure/services/gotenberg-pdf-renderer.service';
import { LocalExportStorageService } from '@/modules/resume/infrastructure/services/local-export-storage.service';
import { ResumeTemplateRenderer } from '@/modules/resume/infrastructure/services/resume-template-renderer.service';
import { S3ExportStorageService } from '@/modules/resume/infrastructure/services/s3-export-storage.service';
import { ResumeTemplateService } from '@/modules/resumeTemplate/infrastructure/services/resume-template.service';
import { RedisRateLimiter } from '@/modules/shared/infrastructure/rate-limiter/redis-rate-limiter.service';
import passwordHasherService from '@/modules/shared/infrastructure/services/password-hasher.service';
import tokenService from '@/modules/shared/infrastructure/services/token.service';
import { PrismaSystemLogQueryRepository } from '@/modules/system/infrastructure/persistence/prisma-system-log.query.repository';
import { OsSystemHealthService } from '@/modules/system/infrastructure/services/os-system-health.service';
import { PrismaSystemLogService } from '@/modules/system/infrastructure/services/prisma-system-log.service';
import { PrismaUserPlanChangeRepository } from '@/modules/user/infrastructure/persistence/prisma-user-plan-change.repository';
import { PrismaUserQueryRepository } from '@/modules/user/infrastructure/persistence/prisma-user.query.repository';
import { PrismaUserRepository } from '@/modules/user/infrastructure/persistence/prisma-user.repository';

const userRepository = new PrismaUserRepository();
const userQueryRepository = new PrismaUserQueryRepository();
const userPlanChangeRepository = new PrismaUserPlanChangeRepository();
const planQueryRepository = new PrismaPlanQueryRepository();
const planCommandRepository = new PrismaPlanCommandRepository();
const planLimitQueryRepository = new PrismaPlanLimitQueryRepository();
const resumeRepository = new PrismaResumeRepository();
const resumeQueryRepository = new PrismaResumeQueryRepository();
const resumeSnapshotRepository = new PrismaResumeSnapshotRepository();
const resumeSnapshotQueryRepository = new PrismaResumeSnapshotQueryRepository();
const resumeExportQueryRepository = new PrismaResumeExportQueryRepository();
const resumeExportRepository = new PrismaResumeExportRepository();
const exportStorage =
  CONFIG.EXPORT_STORAGE_DRIVER === 's3'
    ? new S3ExportStorageService(CONFIG)
    : new LocalExportStorageService();
const pdfRenderer = new GotenbergPdfRenderer();
const resumeTemplateRenderer = new ResumeTemplateRenderer();
const exportEmailQueueService = new BullmqExportEmailQueueService();
const billingService = new BillingService();
const activityService = new ActivityService();
const systemLogService = new PrismaSystemLogService();
const systemLogQueryRepository = new PrismaSystemLogQueryRepository();
const auditLogService = new PrismaAuditLogService();
const auditLogQueryRepository = new PrismaAuditLogQueryRepository();

const exportService = new ExportService(
  resumeSnapshotRepository,
  exportStorage,
  exportEmailQueueService,
  billingService,
  activityService,
  planLimitQueryRepository,
  userQueryRepository,
  resumeExportRepository,
  resumeExportQueryRepository,
  resumeSnapshotQueryRepository,
  resumeQueryRepository,
  pdfRenderer,
  resumeTemplateRenderer
);

const exportQueueService = new BullmqExportQueueService();
const rateLimiter = new RedisRateLimiter();
const bulkApplyEmailQueueService = new BullmqBulkApplyEmailQueueService();
const resumeTemplateService = new ResumeTemplateService();
const systemHealthService = new OsSystemHealthService();

export {
  activityService,
  auditLogQueryRepository,
  auditLogService,
  billingService,
  bulkApplyEmailQueueService,
  exportEmailQueueService,
  exportQueueService,
  exportService,
  exportStorage,
  passwordHasherService,
  pdfRenderer,
  planCommandRepository,
  planLimitQueryRepository,
  planQueryRepository,
  rateLimiter,
  resumeExportQueryRepository,
  resumeExportRepository,
  resumeQueryRepository,
  resumeRepository,
  resumeSnapshotQueryRepository,
  resumeSnapshotRepository,
  resumeTemplateRenderer,
  resumeTemplateService,
  systemHealthService,
  systemLogService,
  systemLogQueryRepository,
  tokenService,
  userQueryRepository,
  userPlanChangeRepository,
  userRepository,
};
