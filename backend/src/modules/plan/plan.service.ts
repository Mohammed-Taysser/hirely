import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';

class PlanService {
  getPaginatedPlans(page: number, limit: number, filters: Prisma.PlanWhereInput) {
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

  getPlanById(id: string) {
    return prisma.plan.findUnique({ where: { id }, include: { limits: true } });
  }

  getPlanByCode(code: string) {
    return prisma.plan.findUnique({ where: { code } });
  }

  createPlan(data: Prisma.PlanCreateInput) {
    return prisma.plan.create({ data, include: { limits: true } });
  }

  updatePlan(id: string, data: Prisma.PlanUpdateInput) {
    return prisma.plan.update({ where: { id }, data, include: { limits: true } });
  }

  deletePlan(id: string) {
    return prisma.plan.delete({ where: { id } });
  }
}

export default new PlanService();
