import { DateRangeInput } from '@/modules/shared/dto/filters.dto';
import { ExportStatus } from '@/modules/export/application/export-status';

export interface ResumeExportDto {
  id: string;
  snapshotId: string;
  userId: string;
  status: ExportStatus;
  url: string | null;
  error: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeExportQueryFilters {
  userId: string;
  resumeId: string;
  status?: ExportStatus;
  createdAt?: DateRangeInput;
}

export interface IResumeExportQueryRepository {
  getPaginatedExports(
    page: number,
    limit: number,
    filters: ResumeExportQueryFilters
  ): Promise<[ResumeExportDto[], number]>;
}
