import { GetExportStatusRequestDto } from './get-export-status.dto';

import { ExportStatusResult } from '@/modules/resume/application/services/export-status.service.interface';
import { IExportService } from '@/modules/resume/application/services/export.service.interface';
import { AppError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type GetExportStatusResponse = Result<ExportStatusResult, AppError>;

export class GetExportStatusUseCase implements UseCase<
  GetExportStatusRequestDto,
  GetExportStatusResponse
> {
  constructor(private readonly exportService: IExportService) {}

  public async execute(request: GetExportStatusRequestDto): Promise<GetExportStatusResponse> {
    try {
      const status = await this.exportService.getExportStatus(request.userId, request.exportId);

      return Result.ok(status);
    } catch (err) {
      if (err instanceof AppError) {
        return Result.fail(err);
      }
      return Result.fail(new UnexpectedError(err));
    }
  }
}
