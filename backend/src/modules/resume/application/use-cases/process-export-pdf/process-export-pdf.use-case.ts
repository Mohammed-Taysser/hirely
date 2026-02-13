import { ProcessExportPdfRequestDto } from './process-export-pdf.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IExportService } from '@/modules/resume/application/services/export.service.interface';
import { AppError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type ProcessExportPdfResponse = Result<void, AppError>;

export class ProcessExportPdfUseCase implements UseCase<
  ProcessExportPdfRequestDto,
  ProcessExportPdfResponse
> {
  constructor(
    private readonly exportService: IExportService,
    private readonly auditLogService: IAuditLogService
  ) {}

  async execute(request: ProcessExportPdfRequestDto): Promise<ProcessExportPdfResponse> {
    try {
      await this.exportService.processPdfExport(request);

      await this.auditLogService.log({
        action: AuditActions.EXPORT_PROCESSED,
        actorUserId: request.userId,
        ...buildAuditEntity('resumeExport', request.exportId),
        metadata: { snapshotId: request.snapshotId },
      });

      return Result.ok();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      await this.auditLogService.log({
        action: AuditActions.EXPORT_FAILED,
        actorUserId: request.userId,
        ...buildAuditEntity('resumeExport', request.exportId),
        metadata: { snapshotId: request.snapshotId, error: message },
      });

      if (err instanceof AppError) {
        return Result.fail(err);
      }
      return Result.fail(new UnexpectedError(err));
    }
  }
}
