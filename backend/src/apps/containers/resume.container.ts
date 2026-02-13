import { RATE_LIMITS } from '@/apps/constant';
import {
  auditLogService,
  bulkApplyEmailQueueService,
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
} from '@/apps/container.shared';
import { BulkApplyUseCase } from '@/modules/resume/application/use-cases/bulk-apply/bulk-apply.use-case';
import { CreateResumeUseCase } from '@/modules/resume/application/use-cases/create-resume/create-resume.use-case';
import { DeleteResumeUseCase } from '@/modules/resume/application/use-cases/delete-resume/delete-resume.use-case';
import { EnqueueResumeExportUseCase } from '@/modules/resume/application/use-cases/enqueue-resume-export/enqueue-resume-export.use-case';
import { ExportResumeUseCase } from '@/modules/resume/application/use-cases/export-resume/export-resume.use-case';
import { GetExportStatusUseCase } from '@/modules/resume/application/use-cases/get-export-status/get-export-status.use-case';
import { GetResumeByIdQueryUseCase } from '@/modules/resume/application/use-cases/get-resume-by-id-query/get-resume-by-id-query.use-case';
import { GetResumeExportStatusUseCase } from '@/modules/resume/application/use-cases/get-resume-export-status/get-resume-export-status.use-case';
import { GetResumeExportsUseCase } from '@/modules/resume/application/use-cases/get-resume-exports/get-resume-exports.use-case';
import { GetResumeSnapshotsUseCase } from '@/modules/resume/application/use-cases/get-resume-snapshots/get-resume-snapshots.use-case';
import { GetResumesUseCase } from '@/modules/resume/application/use-cases/get-resumes/get-resumes.use-case';
import { GetResumesListUseCase } from '@/modules/resume/application/use-cases/get-resumes-list/get-resumes-list.use-case';
import { UpdateResumeUseCase } from '@/modules/resume/application/use-cases/update-resume/update-resume.use-case';

const createResumeUseCase = new CreateResumeUseCase(
  resumeRepository,
  planLimitQueryRepository,
  resumeQueryRepository,
  systemLogService,
  auditLogService
);
const updateResumeUseCase = new UpdateResumeUseCase(
  resumeRepository,
  resumeSnapshotRepository,
  resumeQueryRepository,
  systemLogService,
  auditLogService
);
const deleteResumeUseCase = new DeleteResumeUseCase(
  resumeRepository,
  resumeQueryRepository,
  systemLogService,
  auditLogService
);
const exportResumeUseCase = new ExportResumeUseCase(exportService, auditLogService);
const getResumeByIdQueryUseCase = new GetResumeByIdQueryUseCase(resumeQueryRepository);
const getResumeExportsUseCase = new GetResumeExportsUseCase(resumeExportQueryRepository);
const getResumeExportStatusUseCase = new GetResumeExportStatusUseCase(exportService);
const enqueueResumeExportUseCase = new EnqueueResumeExportUseCase(
  exportService,
  exportQueueService,
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
  getResumeExportStatusUseCase,
  getExportStatusUseCase,
  exportResumeUseCase,
  enqueueResumeExportUseCase,
  bulkApplyUseCase,
  createResumeUseCase,
  updateResumeUseCase,
  deleteResumeUseCase,
};

export { resumeContainer };
