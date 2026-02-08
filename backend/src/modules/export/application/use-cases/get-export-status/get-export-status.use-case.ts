import { GetExportStatusRequestDto } from './get-export-status.dto';

import { AppError, UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import {
  ExportStatusResult,
  IExportStatusService,
} from '@/modules/export/application/services/export-status.service.interface';

type GetExportStatusResponse = Result<ExportStatusResult, AppError>;

export class GetExportStatusUseCase implements UseCase<
  GetExportStatusRequestDto,
  GetExportStatusResponse
> {
  constructor(private readonly exportStatusService: IExportStatusService) {}

  public async execute(request: GetExportStatusRequestDto): Promise<GetExportStatusResponse> {
    try {
      const status = await this.exportStatusService.getExportStatus(
        request.userId,
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
