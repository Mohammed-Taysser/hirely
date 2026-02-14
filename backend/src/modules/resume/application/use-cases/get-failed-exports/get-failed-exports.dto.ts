import { ResumeExportDto } from '@/modules/resume/application/repositories/resume-export.query.repository.interface';

export interface GetFailedExportsRequestDto {
  userId: string;
  page: number;
  limit: number;
}

export interface GetFailedExportsResponseDto {
  exports: ResumeExportDto[];
  total: number;
}
