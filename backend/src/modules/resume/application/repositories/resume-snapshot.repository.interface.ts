import { ResumeData } from '@hirely/resume-core';

export interface ResumeSnapshotDto {
  id: string;
  resumeId: string;
  userId: string;
  data: ResumeData;
  createdAt: Date;
}

export interface IResumeSnapshotRepository {
  createSnapshot(userId: string, resumeId: string): Promise<ResumeSnapshotDto | null>;
}
