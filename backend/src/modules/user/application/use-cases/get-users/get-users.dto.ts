import { UserFullDto, UserQueryFilters } from '../../repositories/user.query.repository.interface';

export interface GetUsersRequestDto {
  page: number;
  limit: number;
  filters: UserQueryFilters;
}

export interface GetUsersResponseDto {
  users: UserFullDto[];
  total: number;
}
