import { Prisma } from '@generated-prisma';

import resumeSelect from '@/modules/shared/prisma-select/resume.select';

export type ResumeFullDto = Prisma.ResumeGetPayload<{ select: typeof resumeSelect.full }>;

export interface IResumeQueryRepository {
  findById(id: string, userId: string): Promise<ResumeFullDto | null>;
}
