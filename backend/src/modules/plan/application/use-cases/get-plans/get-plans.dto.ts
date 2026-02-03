import { Prisma } from '@generated-prisma';

import { PlanDto } from '../../repositories/plan.query.repository.interface';

export interface GetPlansRequestDto {
  page: number;
  limit: number;
  filters: Prisma.PlanWhereInput;
}

export interface GetPlansResponseDto {
  plans: PlanDto[];
  total: number;
}
