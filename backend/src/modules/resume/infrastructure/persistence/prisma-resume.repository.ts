import { IResumeDefaultRepository } from '../../application/repositories/resume-default.repository.interface';
import { IResumeRepository } from '../../domain/repositories/resume.repository.interface';
import { Resume } from '../../domain/resume.aggregate';

import { ResumeMapper } from './resume.mapper';

import prisma from '@/apps/prisma';
import { DomainEvents } from '@/modules/shared/domain/events/domain-events';

export class PrismaResumeRepository implements IResumeRepository, IResumeDefaultRepository {
  async save(resume: Resume): Promise<void> {
    const raw = ResumeMapper.toPersistence(resume);

    await prisma.resume.upsert({
      where: { id: resume.id },
      update: raw,
      create: raw,
    });

    await DomainEvents.dispatchEventsForAggregate(resume.id);
  }

  async findById(id: string, userId: string): Promise<Resume | null> {
    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) return null;

    return ResumeMapper.toDomain(resume);
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.resume.deleteMany({
      where: { id, userId },
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.resume.count({
      where: { userId },
    });
  }

  async setDefaultResume(userId: string, resumeId: string): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      await transaction.resume.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });

      await transaction.resume.updateMany({
        where: { id: resumeId, userId },
        data: { isDefault: true },
      });
    });
  }

  async findOldestResumeIdByUserId(
    userId: string,
    excludeResumeId?: string
  ): Promise<string | null> {
    const resume = await prisma.resume.findFirst({
      where: {
        userId,
        ...(excludeResumeId ? { id: { not: excludeResumeId } } : {}),
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true },
    });

    return resume?.id ?? null;
  }
}
