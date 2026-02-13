import { ResumeData } from '@hirely/resume-core';

export interface ResumeSnapshotWithResumeDto {
  id: string;
  resumeId: string;
  userId: string;
  data: ResumeData;
  templateId: string | null;
  themeConfig: Record<string, unknown> | null;
}

export interface IResumeSnapshotQueryRepository {
  findByIdWithResume(
    userId: string,
    snapshotId: string
  ): Promise<ResumeSnapshotWithResumeDto | null>;
}
