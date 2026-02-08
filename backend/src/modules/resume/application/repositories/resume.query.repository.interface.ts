import { ResumeData } from '@hirely/resume-core';

import { DateRangeInput } from '@/modules/shared/dto/filters.dto';

export interface ResumeBasicDto {
  id: string;
  name: string;
}

export interface ResumeFullDto extends ResumeBasicDto {
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  data: ResumeData;
}

export interface ResumeSnapshotDto {
  id: string;
  resumeId: string;
  userId: string;
  data: ResumeData;
  createdAt: Date;
}

export interface ResumeQueryFilters {
  userId: string;
  createdAt?: DateRangeInput;
}

export interface ResumeSnapshotsQueryFilters {
  userId: string;
  resumeId: string;
  createdAt?: DateRangeInput;
}

export interface IResumeQueryRepository {
  findById(id: string, userId: string): Promise<ResumeFullDto | null>;
  getPaginatedResumes(
    page: number,
    limit: number,
    filters: ResumeQueryFilters
  ): Promise<[ResumeFullDto[], number]>;
  getBasicResumes(filters: ResumeQueryFilters): Promise<ResumeBasicDto[]>;
  getPaginatedSnapshots(
    page: number,
    limit: number,
    filters: ResumeSnapshotsQueryFilters
  ): Promise<[ResumeSnapshotDto[], number]>;
}
