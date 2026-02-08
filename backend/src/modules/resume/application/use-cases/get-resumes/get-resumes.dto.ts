import {
  ResumeFullDto,
  ResumeQueryFilters,
} from '../../repositories/resume.query.repository.interface';

export interface GetResumesRequestDto {
  page: number;
  limit: number;
  filters: ResumeQueryFilters;
}

export interface GetResumesResponseDto {
  resumes: ResumeFullDto[];
  total: number;
}
