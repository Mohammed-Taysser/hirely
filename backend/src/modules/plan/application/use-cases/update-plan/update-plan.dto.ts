import { Prisma } from '@generated-prisma';

export interface UpdatePlanRequestDto {
  planId: string;
  data: Prisma.PlanUpdateInput;
}
