import { Prisma } from '@generated-prisma';

import { ResumeFullDto } from '../../repositories/resume.query.repository.interface';

export interface GetResumesRequestDto {
  page: number;
  limit: number;
  filters: Prisma.ResumeWhereInput;
}

export interface GetResumesResponseDto {
  resumes: ResumeFullDto[];
  total: number;
}
