import { Prisma } from '@generated-prisma';

export type PlanLimitDto = Prisma.PlanLimitGetPayload<{}>;

export interface IPlanLimitQueryRepository {
  findByPlanId(planId: string): Promise<PlanLimitDto | null>;
}
