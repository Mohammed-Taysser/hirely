import prisma from '@/apps/prisma';
import {
  IPlanLimitQueryRepository,
  PlanLimitDto,
} from '@/modules/plan/application/repositories/plan-limit.query.repository.interface';

export class PrismaPlanLimitQueryRepository implements IPlanLimitQueryRepository {
  async findByPlanId(planId: string): Promise<PlanLimitDto | null> {
    return prisma.planLimit.findUnique({ where: { planId } });
  }
}
