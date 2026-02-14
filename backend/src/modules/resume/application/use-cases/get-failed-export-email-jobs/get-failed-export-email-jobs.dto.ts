import { FailedExportEmailJobDto } from '@/modules/system/application/repositories/system-log.query.repository.interface';

export interface GetFailedExportEmailJobsRequestDto {
  userId: string;
  page: number;
  limit: number;
}

export interface GetFailedExportEmailJobsResponseDto {
  jobs: FailedExportEmailJobDto[];
  total: number;
}
