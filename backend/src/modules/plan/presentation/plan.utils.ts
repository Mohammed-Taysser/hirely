import dateService from '../../shared/presentation/date.service';
import { TypedAuthenticatedRequest } from '../../shared/presentation/import';

import { PlanDTO } from './plan.dto';

import { PlanQueryFilters } from '@/modules/plan/application/repositories/plan.query.repository.interface';

function getPlansFilter(request: TypedAuthenticatedRequest<PlanDTO['getPlans']>) {
  const filters: PlanQueryFilters = {};
  const query = request.parsedQuery;

  if (query.code) {
    filters.code = query.code;
  }

  if (query.name) {
    filters.name = query.name;
  }

  if (query.createdAt) {
    filters.createdAt = dateService.buildDateRangeFilter(query.createdAt);
  }

  return filters;
}

export { getPlansFilter };
