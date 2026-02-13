import { GetResumeExportStatusRequestDto } from './get-resume-export-status.dto';

import { ExportStatusResult } from '@/modules/resume/application/services/export-status.service.interface';
import { IExportService } from '@/modules/resume/application/services/export.service.interface';
import { AppError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type GetResumeExportStatusResponse = Result<ExportStatusResult, AppError>;

export class GetResumeExportStatusUseCase implements UseCase<
  GetResumeExportStatusRequestDto,
  GetResumeExportStatusResponse
> {
  constructor(private readonly exportService: IExportService) {}

  public async execute(
    request: GetResumeExportStatusRequestDto
  ): Promise<GetResumeExportStatusResponse> {
    try {
      const status = await this.exportService.getExportStatusForResume(
        request.userId,
        request.resumeId,
        request.exportId
      );

      return Result.ok(status);
    } catch (err) {
      if (err instanceof AppError) {
        return Result.fail(err);
      }
      return Result.fail(new UnexpectedError(err));
    }
  }
}
