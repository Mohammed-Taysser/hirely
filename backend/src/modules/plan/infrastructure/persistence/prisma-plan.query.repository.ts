import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import {
  IPlanQueryRepository,
  PlanDto,
  PlanQueryFilters,
} from '@/modules/plan/application/repositories/plan.query.repository.interface';
import { toDateTimeFilter } from '@/modules/shared/infrastructure/prisma/filters';

const buildPlanFilters = (filters: PlanQueryFilters): Prisma.PlanWhereInput => {
  const where: Prisma.PlanWhereInput = {};

  if (filters.code) {
    where.code = { contains: filters.code, mode: 'insensitive' };
  }

  if (filters.name) {
    where.name = { contains: filters.name, mode: 'insensitive' };
  }

  const createdAt = toDateTimeFilter(filters.createdAt);
  if (createdAt) {
    where.createdAt = createdAt;
  }

  return where;
};

export class PrismaPlanQueryRepository implements IPlanQueryRepository {
  async getPaginatedPlans(
    page: number,
    limit: number,
    filters: PlanQueryFilters
  ): Promise<[PlanDto[], number]> {
    const skip = (page - 1) * limit;
    const where = buildPlanFilters(filters);

    return prisma.$transaction([
      prisma.plan.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        include: { limits: true },
      }),
      prisma.plan.count({ where }),
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
