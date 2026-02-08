import {
  ResumeExportDto,
  ResumeExportQueryFilters,
} from '../../repositories/resume-export.query.repository.interface';

export interface GetResumeExportsRequestDto {
  page: number;
  limit: number;
  filters: ResumeExportQueryFilters;
}

export interface GetResumeExportsResponseDto {
  exports: ResumeExportDto[];
  total: number;
}
