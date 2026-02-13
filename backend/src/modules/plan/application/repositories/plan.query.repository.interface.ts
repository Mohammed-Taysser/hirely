import { DateRangeInput } from '@/modules/shared/application/filters';

export interface PlanLimitDto {
  id: string;
  maxResumes: number;
  maxExports: number;
  dailyUploadMb: number;
  planId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  limits?: PlanLimitDto | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanQueryFilters {
  code?: string;
  name?: string;
  createdAt?: DateRangeInput;
}

export interface IPlanQueryRepository {
  getPaginatedPlans(
    page: number,
    limit: number,
    filters: PlanQueryFilters
  ): Promise<[PlanDto[], number]>;
  findById(id: string): Promise<PlanDto | null>;
  findByCode(code: string): Promise<PlanDto | null>;
}
