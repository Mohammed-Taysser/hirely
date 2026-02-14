import {
  GetExportOpsMetricsRequestDto,
  GetExportOpsMetricsResponseDto,
} from './get-export-ops-metrics.dto';

import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import { ISystemLogQueryRepository } from '@/modules/system/application/repositories/system-log.query.repository.interface';
import { SystemActions } from '@/modules/system/application/system.actions';

type GetExportOpsMetricsResponse = Result<GetExportOpsMetricsResponseDto, UnexpectedError>;

export class GetExportOpsMetricsUseCase implements UseCase<
  GetExportOpsMetricsRequestDto,
  GetExportOpsMetricsResponse
> {
  constructor(private readonly systemLogQueryRepository: ISystemLogQueryRepository) {}

  async execute(request: GetExportOpsMetricsRequestDto): Promise<GetExportOpsMetricsResponse> {
    try {
      const now = Date.now();
      const sinceDate = new Date(now - request.hours * 60 * 60 * 1000);

      const actionCounts = await this.systemLogQueryRepository.getActionCounts(
        [
          SystemActions.EXPORT_PDF_PROCESSED,
          SystemActions.EXPORT_PDF_FAILED,
          SystemActions.EXPORT_EMAIL_SENT,
          SystemActions.EXPORT_EMAIL_FAILED,
          SystemActions.EXPORT_CLEANUP_RUN_COMPLETED,
          SystemActions.EXPORT_CLEANUP_RUN_FAILED,
        ],
        sinceDate
      );

      return Result.ok({
        timeframeHours: request.hours,
        since: sinceDate.toISOString(),
        counters: {
          pdfProcessed: actionCounts[SystemActions.EXPORT_PDF_PROCESSED] ?? 0,
          pdfFailed: actionCounts[SystemActions.EXPORT_PDF_FAILED] ?? 0,
          emailSent: actionCounts[SystemActions.EXPORT_EMAIL_SENT] ?? 0,
          emailFailed: actionCounts[SystemActions.EXPORT_EMAIL_FAILED] ?? 0,
          cleanupCompleted: actionCounts[SystemActions.EXPORT_CLEANUP_RUN_COMPLETED] ?? 0,
          cleanupFailed: actionCounts[SystemActions.EXPORT_CLEANUP_RUN_FAILED] ?? 0,
        },
      });
    } catch (error) {
      return Result.fail(new UnexpectedError(error));
    }
  }
}
