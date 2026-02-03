import { Prisma } from '@generated-prisma';

import { ResumeSnapshotDto } from '../../repositories/resume.query.repository.interface';

export interface GetResumeSnapshotsRequestDto {
  page: number;
  limit: number;
  filters: Prisma.ResumeSnapshotWhereInput;
}

export interface GetResumeSnapshotsResponseDto {
  snapshots: ResumeSnapshotDto[];
  total: number;
}
