import { Prisma } from '@generated-prisma';

export type PlanDto = Prisma.PlanGetPayload<{ include: { limits: true } }>;

export interface IPlanQueryRepository {
  getPaginatedPlans(
    page: number,
    limit: number,
    filters: Prisma.PlanWhereInput
  ): Promise<[PlanDto[], number]>;
  findById(id: string): Promise<PlanDto | null>;
  findByCode(code: string): Promise<PlanDto | null>;
}
