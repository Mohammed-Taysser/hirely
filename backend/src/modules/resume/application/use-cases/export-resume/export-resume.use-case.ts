import { ExportResumeRequestDto } from './export-resume.dto';

import { AuditActions } from '@/modules/audit/application/audit.actions';
import { buildAuditEntity } from '@/modules/audit/application/audit.entity';
import { IAuditLogService } from '@/modules/audit/application/services/audit-log.service.interface';
import { IExportService } from '@/modules/resume/application/services/export.service.interface';
import { ResumeExportResult } from '@/modules/resume/application/services/resume-export.service.interface';
import { AppError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type ExportResumeResponse = Result<ResumeExportResult, AppError>;

export class ExportResumeUseCase implements UseCase<ExportResumeRequestDto, ExportResumeResponse> {
  constructor(
    private readonly exportService: IExportService,
    private readonly auditLogService: IAuditLogService
  ) {}

  public async execute(request: ExportResumeRequestDto): Promise<ExportResumeResponse> {
    try {
      const result = await this.exportService.generatePdfBuffer(request.userId, request.resumeId);

      await this.auditLogService.log({
        action: AuditActions.RESUME_EXPORT_DOWNLOADED,
        actorUserId: request.userId,
        ...buildAuditEntity('resume', request.resumeId),
      });

      return Result.ok(result);
    } catch (err) {
      if (err instanceof AppError) {
        return Result.fail(err);
      }

      return Result.fail(new UnexpectedError(err));
    }
  }
}
