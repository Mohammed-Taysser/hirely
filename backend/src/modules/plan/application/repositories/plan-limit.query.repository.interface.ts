import { PlanLimitDto } from '@/modules/plan/application/dto/plan-limit.dto';

export interface IPlanLimitQueryRepository {
  findByPlanId(planId: string): Promise<PlanLimitDto | null>;
}
