import { ResumeData } from '@hirely/resume-core';

import prisma from '@/apps/prisma';
import {
  IResumeSnapshotQueryRepository,
  ResumeSnapshotWithResumeDto,
} from '@/modules/resume/application/repositories/resume-snapshot.query.repository.interface';

export class PrismaResumeSnapshotQueryRepository implements IResumeSnapshotQueryRepository {
  async findByIdWithResume(
    userId: string,
    snapshotId: string
  ): Promise<ResumeSnapshotWithResumeDto | null> {
    const snapshot = await prisma.resumeSnapshot.findFirst({
      where: { id: snapshotId, userId },
      include: {
        resume: {
          select: {
            templateId: true,
            themeConfig: true,
          },
        },
      },
    });

    if (!snapshot) {
      return null;
    }

    return {
      id: snapshot.id,
      resumeId: snapshot.resumeId,
      userId: snapshot.userId,
      data: snapshot.data as ResumeData,
      templateId: snapshot.resume?.templateId ?? null,
      themeConfig: (snapshot.resume?.themeConfig as Record<string, unknown> | null) ?? null,
    };
  }
}
