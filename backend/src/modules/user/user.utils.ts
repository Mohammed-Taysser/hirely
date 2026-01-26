import { Prisma } from '@generated-prisma';

import dateService from '../shared/services/date.service';
import { TypedRequest } from '../shared/types/import';

import { UserDTO } from './user.dto';

function getUsersFilter(request: TypedRequest<UserDTO['getUsersList']>) {
  const filters: Prisma.UserWhereInput = {};

  const query = request.parsedQuery;

  if (query.name) {
    filters.name = {
      contains: query.name,
    };
  }

  if (query.email) {
    filters.email = {
      contains: query.email,
    };
  }

  if (query.createdAt) {
    filters.createdAt = dateService.buildDateRangeFilter(query.createdAt);
  }

  return filters;
}

export { getUsersFilter };
