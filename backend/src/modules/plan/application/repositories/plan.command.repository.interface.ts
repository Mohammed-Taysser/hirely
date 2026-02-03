import { Prisma } from '@generated-prisma';

export type PlanCommandDto = Prisma.PlanGetPayload<{ include: { limits: true } }>;

export interface IPlanCommandRepository {
  create(data: Prisma.PlanCreateInput): Promise<PlanCommandDto>;
  update(id: string, data: Prisma.PlanUpdateInput): Promise<PlanCommandDto>;
  delete(id: string): Promise<PlanCommandDto>;
}
