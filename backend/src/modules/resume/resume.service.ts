import { Prisma } from '@generated-prisma';

import resumeSelect from '../shared/prisma-select/resume.select';

import prisma from '@/apps/prisma';

class ResumeService {
  findResumeById(id: string, userId: string) {
    return prisma.resume.findFirst({ where: { id, userId }, select: resumeSelect.full });
  }

  countUserResumes(userId: string) {
    return prisma.resume.count({ where: { userId } });
  }

  getPlanLimit(planId: string) {
    return prisma.planLimit.findUnique({ where: { planId } });
  }

  async createSnapshot(userId: string, resumeId: string) {
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
    });
  }

  getPaginatedSnapshots(page: number, limit: number, filters: Prisma.ResumeSnapshotWhereInput) {
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

  getPaginatedExports(page: number, limit: number, filters: Prisma.ResumeExportWhereInput) {
    const skip = (page - 1) * limit;

    return prisma.$transaction([
      prisma.resumeExport.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: filters,
        select: {
          id: true,
          snapshotId: true,
          userId: true,
          status: true,
          url: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.resumeExport.count({ where: filters }),
    ]);
  }

  getPaginatedResumes(page: number, limit: number, filters: Prisma.ResumeWhereInput) {
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

  getBasicResumes(filters: Prisma.ResumeWhereInput) {
    return prisma.resume.findMany({ select: resumeSelect.basic, where: filters });
  }

  createResume(data: Prisma.ResumeCreateInput) {
    return prisma.resume.create({ data, select: resumeSelect.full });
  }

  updateResume(id: string, data: Prisma.ResumeUpdateInput) {
    return prisma.resume.update({ where: { id }, data, select: resumeSelect.full });
  }

  deleteResumeById(id: string) {
    return prisma.resume.delete({ where: { id }, select: resumeSelect.full });
  }
}

export default new ResumeService();
