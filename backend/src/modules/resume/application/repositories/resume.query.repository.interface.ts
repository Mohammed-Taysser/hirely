import { Prisma } from '@generated-prisma';

import resumeSelect from '@/modules/shared/prisma-select/resume.select';

export type ResumeFullDto = Prisma.ResumeGetPayload<{ select: typeof resumeSelect.full }>;
export type ResumeBasicDto = Prisma.ResumeGetPayload<{ select: typeof resumeSelect.basic }>;
export type ResumeSnapshotDto = Prisma.ResumeSnapshotGetPayload<{
  select: {
    id: true;
    resumeId: true;
    userId: true;
    data: true;
    createdAt: true;
  };
}>;

export interface IResumeQueryRepository {
  findById(id: string, userId: string): Promise<ResumeFullDto | null>;
  getPaginatedResumes(
    page: number,
    limit: number,
    filters: Prisma.ResumeWhereInput
  ): Promise<[ResumeFullDto[], number]>;
  getBasicResumes(filters: Prisma.ResumeWhereInput): Promise<ResumeBasicDto[]>;
  getPaginatedSnapshots(
    page: number,
    limit: number,
    filters: Prisma.ResumeSnapshotWhereInput
  ): Promise<[ResumeSnapshotDto[], number]>;
}
