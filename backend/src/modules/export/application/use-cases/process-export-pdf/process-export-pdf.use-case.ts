import { ProcessExportPdfRequestDto } from './process-export-pdf.dto';

import { AppError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { IExportService } from '@/modules/export/application/services/export.service.interface';

type ProcessExportPdfResponse = Result<void, AppError>;

export class ProcessExportPdfUseCase implements UseCase<
  ProcessExportPdfRequestDto,
  ProcessExportPdfResponse
> {
  constructor(private readonly exportService: IExportService) {}

  async execute(request: ProcessExportPdfRequestDto): Promise<ProcessExportPdfResponse> {
    try {
      await this.exportService.processPdfExport(request);
      return Result.ok();
    } catch (err) {
      if (err instanceof AppError) {
        return Result.fail(err);
      }
      return Result.fail(new UnexpectedError(err));
    }
  }
}
