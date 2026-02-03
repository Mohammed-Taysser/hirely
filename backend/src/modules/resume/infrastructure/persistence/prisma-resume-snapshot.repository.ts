import { Prisma } from '@generated-prisma';

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

    return prisma.resumeSnapshot.create({
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
  }
}
