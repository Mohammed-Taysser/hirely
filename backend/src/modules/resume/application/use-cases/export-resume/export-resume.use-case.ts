import { ExportResumeRequestDto } from './export-resume.dto';

import { NotFoundError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import {
  IResumeExportService,
  ResumeExportResult,
} from '@/modules/resume/application/services/resume-export.service.interface';

type ExportResumeResponse = Result<ResumeExportResult, NotFoundError | UnexpectedError>;

export class ExportResumeUseCase implements UseCase<ExportResumeRequestDto, ExportResumeResponse> {
  constructor(private readonly resumeExportService: IResumeExportService) {}

  public async execute(request: ExportResumeRequestDto): Promise<ExportResumeResponse> {
    try {
      const result = await this.resumeExportService.generatePdfBuffer(
        request.userId,
        request.resumeId
      );

      return Result.ok(result);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Resume not found')) {
        return Result.fail(new NotFoundError('Resume not found'));
      }

      return Result.fail(new UnexpectedError(err));
    }
  }
}
