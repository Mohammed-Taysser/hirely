import { Prisma } from '@generated-prisma';
import { ResumeData } from '@hirely/resume-core';

import prisma from '@/apps/prisma';
import {
  IResumeSnapshotRepository,
  ResumeSnapshotDto,
} from '@/modules/resume/application/repositories/resume-snapshot.repository.interface';

export class PrismaResumeSnapshotRepository implements IResumeSnapshotRepository {
  async createSnapshot(userId: string, resumeId: string): Promise<ResumeSnapshotDto | null> {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
      select: { data: true },
    });

    if (!resume) {
      return null;
    }

    const snapshot = await prisma.resumeSnapshot.create({
      data: {
        userId,
        resumeId,
        data: resume.data as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        resumeId: true,
        userId: true,
        data: true,
        createdAt: true,
      },
    });

    return {
      ...snapshot,
      data: snapshot.data as ResumeData,
    };
  }
}
