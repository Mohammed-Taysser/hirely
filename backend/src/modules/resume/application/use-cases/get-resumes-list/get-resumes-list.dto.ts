import {
  ResumeBasicDto,
  ResumeQueryFilters,
} from '../../repositories/resume.query.repository.interface';

export interface GetResumesListRequestDto {
  filters: ResumeQueryFilters;
}

export type GetResumesListResponseDto = ResumeBasicDto[];
