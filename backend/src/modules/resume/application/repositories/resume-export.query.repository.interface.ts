import { ExportStatus } from '@/modules/resume/application/export-status';
import { DateRangeInput } from '@/modules/shared/application/filters';

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
  findById(userId: string, exportId: string): Promise<ResumeExportDto | null>;
  findByIdForResume(
    userId: string,
    resumeId: string,
    exportId: string
  ): Promise<ResumeExportDto | null>;
}
