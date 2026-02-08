import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import {
  IResumeQueryRepository,
  ResumeBasicDto,
  ResumeFullDto,
  ResumeSnapshotDto,
  ResumeQueryFilters,
  ResumeSnapshotsQueryFilters,
} from '@/modules/resume/application/repositories/resume.query.repository.interface';
import resumeSelect from '@/modules/shared/prisma-select/resume.select';
import { toDateTimeFilter } from '@/modules/shared/infra/prisma/filters';
import { ResumeData } from '@hirely/resume-core';

const buildResumeFilters = (filters: ResumeQueryFilters): Prisma.ResumeWhereInput => {
  const where: Prisma.ResumeWhereInput = {
    userId: filters.userId,
  };

  const createdAt = toDateTimeFilter(filters.createdAt);
  if (createdAt) {
    where.createdAt = createdAt;
  }

  return where;
};

const buildSnapshotFilters = (
  filters: ResumeSnapshotsQueryFilters
): Prisma.ResumeSnapshotWhereInput => {
  const where: Prisma.ResumeSnapshotWhereInput = {
    userId: filters.userId,
    resumeId: filters.resumeId,
  };

  const createdAt = toDateTimeFilter(filters.createdAt);
  if (createdAt) {
    where.createdAt = createdAt;
  }

  return where;
};

export class PrismaResumeQueryRepository implements IResumeQueryRepository {
  async findById(id: string, userId: string): Promise<ResumeFullDto | null> {
    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      select: resumeSelect.full,
    });

    if (!resume) {
      return null;
    }

    return {
      ...resume,
      data: resume.data as ResumeData,
    };
  }

  async getPaginatedResumes(
    page: number,
    limit: number,
    filters: ResumeQueryFilters
  ): Promise<[ResumeFullDto[], number]> {
    const skip = (page - 1) * limit;
    const where = buildResumeFilters(filters);

    const [resumes, total] = await prisma.$transaction([
      prisma.resume.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        select: resumeSelect.full,
      }),
      prisma.resume.count({ where }),
    ]);

    return [
      resumes.map((resume) => ({
        ...resume,
        data: resume.data as ResumeData,
      })),
      total,
    ];
  }

  async getBasicResumes(filters: ResumeQueryFilters): Promise<ResumeBasicDto[]> {
    const where = buildResumeFilters(filters);
    return prisma.resume.findMany({ select: resumeSelect.basic, where });
  }

  async getPaginatedSnapshots(
    page: number,
    limit: number,
    filters: ResumeSnapshotsQueryFilters
  ): Promise<[ResumeSnapshotDto[], number]> {
    const skip = (page - 1) * limit;
    const where = buildSnapshotFilters(filters);

    const [snapshots, total] = await prisma.$transaction([
      prisma.resumeSnapshot.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        select: {
          id: true,
          resumeId: true,
          userId: true,
          data: true,
          createdAt: true,
        },
      }),
      prisma.resumeSnapshot.count({ where }),
    ]);

    return [
      snapshots.map((snapshot) => ({
        ...snapshot,
        data: snapshot.data as ResumeData,
      })),
      total,
    ];
  }
}
