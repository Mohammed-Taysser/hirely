import CONFIG from '@/apps/config';
import { RATE_LIMITS } from '@/apps/constant';
import {
  auditLogService,
  bulkApplyEmailQueueService,
  exportEmailQueueService,
  exportQueueService,
  exportService,
  rateLimiter,
  resumeQueryRepository,
  resumeRepository,
  resumeSnapshotRepository,
  systemLogService,
  userQueryRepository,
  planLimitQueryRepository,
  resumeExportQueryRepository,
  resumeExportRepository,
  systemLogQueryRepository,
} from '@/apps/container.shared';
import { BulkApplyUseCase } from '@/modules/resume/application/use-cases/bulk-apply/bulk-apply.use-case';
import { CreateResumeUseCase } from '@/modules/resume/application/use-cases/create-resume/create-resume.use-case';
import { DeleteResumeUseCase } from '@/modules/resume/application/use-cases/delete-resume/delete-resume.use-case';
import { EnqueueResumeExportUseCase } from '@/modules/resume/application/use-cases/enqueue-resume-export/enqueue-resume-export.use-case';
import { ExportResumeUseCase } from '@/modules/resume/application/use-cases/export-resume/export-resume.use-case';
import { GetExportStatusUseCase } from '@/modules/resume/application/use-cases/get-export-status/get-export-status.use-case';
import { GetFailedExportEmailJobsUseCase } from '@/modules/resume/application/use-cases/get-failed-export-email-jobs/get-failed-export-email-jobs.use-case';
import { GetFailedExportsUseCase } from '@/modules/resume/application/use-cases/get-failed-exports/get-failed-exports.use-case';
import { GetResumeByIdQueryUseCase } from '@/modules/resume/application/use-cases/get-resume-by-id-query/get-resume-by-id-query.use-case';
import { GetResumeExportStatusUseCase } from '@/modules/resume/application/use-cases/get-resume-export-status/get-resume-export-status.use-case';
import { GetResumeExportsUseCase } from '@/modules/resume/application/use-cases/get-resume-exports/get-resume-exports.use-case';
import { GetResumeSnapshotsUseCase } from '@/modules/resume/application/use-cases/get-resume-snapshots/get-resume-snapshots.use-case';
import { GetResumesUseCase } from '@/modules/resume/application/use-cases/get-resumes/get-resumes.use-case';
import { GetResumesListUseCase } from '@/modules/resume/application/use-cases/get-resumes-list/get-resumes-list.use-case';
import { RetryFailedExportUseCase } from '@/modules/resume/application/use-cases/retry-failed-export/retry-failed-export.use-case';
import { RetryFailedExportEmailJobUseCase } from '@/modules/resume/application/use-cases/retry-failed-export-email-job/retry-failed-export-email-job.use-case';
import { SetDefaultResumeUseCase } from '@/modules/resume/application/use-cases/set-default-resume/set-default-resume.use-case';
import { UpdateResumeUseCase } from '@/modules/resume/application/use-cases/update-resume/update-resume.use-case';

const createResumeUseCase = new CreateResumeUseCase(
  resumeRepository,
  planLimitQueryRepository,
  resumeQueryRepository,
  CONFIG.MAX_RESUME_SECTIONS,
  systemLogService,
  auditLogService
);
const updateResumeUseCase = new UpdateResumeUseCase(
  resumeRepository,
  resumeSnapshotRepository,
  resumeQueryRepository,
  CONFIG.MAX_RESUME_SECTIONS,
  systemLogService,
  auditLogService
);
const deleteResumeUseCase = new DeleteResumeUseCase(
  resumeRepository,
  resumeRepository,
  resumeQueryRepository,
  systemLogService,
  auditLogService
);
const setDefaultResumeUseCase = new SetDefaultResumeUseCase(
  resumeRepository,
  resumeQueryRepository,
  systemLogService,
  auditLogService
);
const exportResumeUseCase = new ExportResumeUseCase(exportService, auditLogService);
const getResumeByIdQueryUseCase = new GetResumeByIdQueryUseCase(resumeQueryRepository);
const getResumeExportsUseCase = new GetResumeExportsUseCase(resumeExportQueryRepository);
const getFailedExportsUseCase = new GetFailedExportsUseCase(resumeExportQueryRepository);
const getFailedExportEmailJobsUseCase = new GetFailedExportEmailJobsUseCase(
  systemLogQueryRepository
);
const getResumeExportStatusUseCase = new GetResumeExportStatusUseCase(exportService);
const enqueueResumeExportUseCase = new EnqueueResumeExportUseCase(
  exportService,
  exportQueueService,
  resumeExportQueryRepository,
  resumeSnapshotRepository,
  userQueryRepository,
  rateLimiter,
  systemLogService,
  auditLogService
);
const getResumesUseCase = new GetResumesUseCase(resumeQueryRepository);
const getResumesListUseCase = new GetResumesListUseCase(resumeQueryRepository);
const getResumeSnapshotsUseCase = new GetResumeSnapshotsUseCase(resumeQueryRepository);
const getExportStatusUseCase = new GetExportStatusUseCase(exportService);
const retryFailedExportUseCase = new RetryFailedExportUseCase(
  resumeExportQueryRepository,
  resumeExportRepository,
  exportQueueService,
  rateLimiter,
  RATE_LIMITS.EXPORT_RETRY,
  systemLogService,
  auditLogService
);
const retryFailedExportEmailJobUseCase = new RetryFailedExportEmailJobUseCase(
  systemLogQueryRepository,
  resumeExportQueryRepository,
  exportEmailQueueService,
  bulkApplyEmailQueueService,
  rateLimiter,
  RATE_LIMITS.EXPORT_EMAIL_RETRY,
  systemLogService,
  auditLogService
);
const bulkApplyUseCase = new BulkApplyUseCase(
  exportService,
  exportQueueService,
  resumeSnapshotRepository,
  userQueryRepository,
  rateLimiter,
  bulkApplyEmailQueueService,
  RATE_LIMITS.BULK_APPLY,
  systemLogService,
  auditLogService
);

const resumeContainer = {
  getResumesUseCase,
  getResumesListUseCase,
  getResumeByIdQueryUseCase,
  getResumeSnapshotsUseCase,
  getResumeExportsUseCase,
  getFailedExportsUseCase,
  getFailedExportEmailJobsUseCase,
  getResumeExportStatusUseCase,
  getExportStatusUseCase,
  retryFailedExportUseCase,
  retryFailedExportEmailJobUseCase,
  exportResumeUseCase,
  enqueueResumeExportUseCase,
  bulkApplyUseCase,
  createResumeUseCase,
  updateResumeUseCase,
  deleteResumeUseCase,
  setDefaultResumeUseCase,
};

export { resumeContainer };
