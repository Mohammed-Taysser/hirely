import { Prisma } from '@generated-prisma';

import { ResumeExportDto } from '../../repositories/resume-export.query.repository.interface';

export interface GetResumeExportsRequestDto {
  page: number;
  limit: number;
  filters: Prisma.ResumeExportWhereInput;
}

export interface GetResumeExportsResponseDto {
  exports: ResumeExportDto[];
  total: number;
}
