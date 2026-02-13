import dateService from '../../shared/presentation/date.service';
import { TypedRequest } from '../../shared/presentation/import';

import { UserDTO } from './user.dto';

import { UserQueryFilters } from '@/modules/user/application/repositories/user.query.repository.interface';

function getUsersFilter(request: TypedRequest<UserDTO['getUsersList']>) {
  const filters: UserQueryFilters = {};

  const query = request.parsedQuery;

  if (query.name) {
    filters.name = query.name;
  }

  if (query.email) {
    filters.email = query.email;
  }

  if (query.createdAt) {
    filters.createdAt = dateService.buildDateRangeFilter(query.createdAt);
  }

  return filters;
}

export { getUsersFilter };
