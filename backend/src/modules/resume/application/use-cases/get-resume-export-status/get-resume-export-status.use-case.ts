import { GetResumeExportStatusRequestDto } from './get-resume-export-status.dto';

import { AppError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import {
  IResumeExportService,
  ResumeExportStatusResult,
} from '@/modules/resume/application/services/resume-export.service.interface';

type GetResumeExportStatusResponse = Result<ResumeExportStatusResult, AppError>;

export class GetResumeExportStatusUseCase implements UseCase<
  GetResumeExportStatusRequestDto,
  GetResumeExportStatusResponse
> {
  constructor(private readonly resumeExportService: IResumeExportService) {}

  public async execute(
    request: GetResumeExportStatusRequestDto
  ): Promise<GetResumeExportStatusResponse> {
    try {
      const status = await this.resumeExportService.getExportStatusForResume(
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
