import { ExportStatus, Prisma } from '@generated-prisma';

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

export interface IResumeExportQueryRepository {
  getPaginatedExports(
    page: number,
    limit: number,
    filters: Prisma.ResumeExportWhereInput
  ): Promise<[ResumeExportDto[], number]>;
}
