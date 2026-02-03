import { Prisma } from '@generated-prisma';

import { ResumeBasicDto } from '../../repositories/resume.query.repository.interface';

export interface GetResumesListRequestDto {
  filters: Prisma.ResumeWhereInput;
}

export type GetResumesListResponseDto = ResumeBasicDto[];
