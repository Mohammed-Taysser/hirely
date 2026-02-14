import {
  CleanupExpiredExportsRequestDto,
  CleanupExpiredExportsResponseDto,
} from './cleanup-expired-exports.dto';

import { IResumeExportRepository } from '@/modules/resume/application/repositories/resume-export.repository.interface';
import { IExportStorageService } from '@/modules/resume/application/services/export-storage.service.interface';
import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';

type CleanupExpiredExportsResponse = Result<CleanupExpiredExportsResponseDto, UnexpectedError>;

const MAX_FAILURES_IN_RESPONSE = 20;

export class CleanupExpiredExportsUseCase implements UseCase<
  CleanupExpiredExportsRequestDto,
  CleanupExpiredExportsResponse
> {
  constructor(
    private readonly resumeExportRepository: IResumeExportRepository,
    private readonly exportStorageService: IExportStorageService
  ) {}

  async execute(request: CleanupExpiredExportsRequestDto): Promise<CleanupExpiredExportsResponse> {
    try {
      const now = request.now ?? new Date();
      const dryRun = request.dryRun ?? false;
      const expiredExports = await this.resumeExportRepository.findExpired(now, request.batchSize);
      const wouldDeleteRecords = expiredExports.length;
      const wouldDeleteFiles = expiredExports.filter((record) => Boolean(record.url)).length;

      if (dryRun) {
        return Result.ok({
          scanned: expiredExports.length,
          deletedRecords: 0,
          deletedFiles: 0,
          wouldDeleteRecords,
          wouldDeleteFiles,
          dryRun: true,
          failed: 0,
          failures: [],
        });
      }

      const deletableIds: string[] = [];
      const failures: CleanupExpiredExportsResponseDto['failures'] = [];
      let deletedFiles = 0;

      for (const exportRecord of expiredExports) {
        try {
          if (exportRecord.url) {
            await this.exportStorageService.deleteObject(exportRecord.url);
            deletedFiles += 1;
          }

          deletableIds.push(exportRecord.id);
        } catch (error) {
          failures.push({
            exportId: exportRecord.id,
            userId: exportRecord.userId,
            reason: error instanceof Error ? error.message : 'Unknown cleanup error',
          });
        }
      }

      const deletedRecords = await this.resumeExportRepository.deleteByIds(deletableIds);

      return Result.ok({
        scanned: expiredExports.length,
        deletedRecords,
        deletedFiles,
        wouldDeleteRecords,
        wouldDeleteFiles,
        dryRun: false,
        failed: failures.length,
        failures: failures.slice(0, MAX_FAILURES_IN_RESPONSE),
      });
    } catch (error) {
      return Result.fail(new UnexpectedError(error));
    }
  }
}
