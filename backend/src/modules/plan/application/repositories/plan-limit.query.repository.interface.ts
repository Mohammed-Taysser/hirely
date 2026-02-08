import { PlanLimitDto } from '@/modules/plan/application/repositories/plan.query.repository.interface';

export type { PlanLimitDto };

export interface IPlanLimitQueryRepository {
  findByPlanId(planId: string): Promise<PlanLimitDto | null>;
}
