import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import {
  IResumeQueryRepository,
  ResumeBasicDto,
  ResumeFullDto,
  ResumeSnapshotDto,
} from '@/modules/resume/application/repositories/resume.query.repository.interface';
import resumeSelect from '@/modules/shared/prisma-select/resume.select';

export class PrismaResumeQueryRepository implements IResumeQueryRepository {
  async findById(id: string, userId: string): Promise<ResumeFullDto | null> {
    return prisma.resume.findFirst({
      where: { id, userId },
      select: resumeSelect.full,
    });
  }

  async getPaginatedResumes(
    page: number,
    limit: number,
    filters: Prisma.ResumeWhereInput
  ): Promise<[ResumeFullDto[], number]> {
    const skip = (page - 1) * limit;

    return prisma.$transaction([
      prisma.resume.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: filters,
        select: resumeSelect.full,
      }),
      prisma.resume.count({ where: filters }),
    ]);
  }

  async getBasicResumes(filters: Prisma.ResumeWhereInput): Promise<ResumeBasicDto[]> {
    return prisma.resume.findMany({ select: resumeSelect.basic, where: filters });
  }

  async getPaginatedSnapshots(
    page: number,
    limit: number,
    filters: Prisma.ResumeSnapshotWhereInput
  ): Promise<[ResumeSnapshotDto[], number]> {
    const skip = (page - 1) * limit;

    return prisma.$transaction([
      prisma.resumeSnapshot.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: filters,
        select: {
          id: true,
          resumeId: true,
          userId: true,
          data: true,
          createdAt: true,
        },
      }),
      prisma.resumeSnapshot.count({ where: filters }),
    ]);
  }
}
