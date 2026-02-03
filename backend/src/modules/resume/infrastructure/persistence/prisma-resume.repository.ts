import { IResumeRepository } from '../../domain/repositories/resume.repository.interface';
import { Resume } from '../../domain/resume.aggregate';

import { ResumeMapper } from './resume.mapper';

import prisma from '@/apps/prisma';
import { DomainEvents } from '@/modules/shared/domain/events/domain-events';

export class PrismaResumeRepository implements IResumeRepository {
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
}
