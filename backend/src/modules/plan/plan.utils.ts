import { Prisma } from '@generated-prisma';

import dateService from '../shared/services/date.service';
import { TypedAuthenticatedRequest } from '../shared/types/import';

import { PlanDTO } from './plan.dto';

function getPlansFilter(request: TypedAuthenticatedRequest<PlanDTO['getPlans']>) {
  const filters: Prisma.PlanWhereInput = {};
  const query = request.parsedQuery;

  if (query.code) {
    filters.code = { contains: query.code, mode: 'insensitive' };
  }

  if (query.name) {
    filters.name = { contains: query.name, mode: 'insensitive' };
  }

  if (query.createdAt) {
    filters.createdAt = dateService.buildDateRangeFilter(query.createdAt);
  }

  return filters;
}

export { getPlansFilter };
