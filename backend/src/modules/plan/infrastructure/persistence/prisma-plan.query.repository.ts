import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import {
  IPlanQueryRepository,
  PlanDto,
} from '@/modules/plan/application/repositories/plan.query.repository.interface';

export class PrismaPlanQueryRepository implements IPlanQueryRepository {
  async getPaginatedPlans(
    page: number,
    limit: number,
    filters: Prisma.PlanWhereInput
  ): Promise<[PlanDto[], number]> {
    const skip = (page - 1) * limit;

    return prisma.$transaction([
      prisma.plan.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: filters,
        include: { limits: true },
      }),
      prisma.plan.count({ where: filters }),
    ]);
  }

  async findById(id: string): Promise<PlanDto | null> {
    return prisma.plan.findUnique({
      where: { id },
      include: { limits: true },
    });
  }

  async findByCode(code: string): Promise<PlanDto | null> {
    return prisma.plan.findUnique({
      where: { code },
      include: { limits: true },
    });
  }
}
