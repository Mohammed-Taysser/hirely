import { Prisma } from '@generated-prisma';

export interface ResumeSnapshotDto {
  id: string;
  resumeId: string;
  userId: string;
  data: Prisma.JsonValue;
  createdAt: Date;
}

export interface IResumeSnapshotRepository {
  createSnapshot(userId: string, resumeId: string): Promise<ResumeSnapshotDto | null>;
}
