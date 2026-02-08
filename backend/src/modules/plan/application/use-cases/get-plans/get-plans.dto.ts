import { PlanDto, PlanQueryFilters } from '../../repositories/plan.query.repository.interface';

export interface GetPlansRequestDto {
  page: number;
  limit: number;
  filters: PlanQueryFilters;
}

export interface GetPlansResponseDto {
  plans: PlanDto[];
  total: number;
}
