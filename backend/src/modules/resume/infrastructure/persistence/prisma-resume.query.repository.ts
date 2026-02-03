import resumeSelect from '@/modules/shared/prisma-select/resume.select';
import prisma from '@/apps/prisma';
import {
  IResumeQueryRepository,
  ResumeFullDto,
} from '@/modules/resume/application/repositories/resume.query.repository.interface';

export class PrismaResumeQueryRepository implements IResumeQueryRepository {
  async findById(id: string, userId: string): Promise<ResumeFullDto | null> {
    return prisma.resume.findFirst({
      where: { id, userId },
      select: resumeSelect.full,
    });
  }
}
