import { UserBasicDto, UserQueryFilters } from '../../repositories/user.query.repository.interface';

export interface GetUsersListRequestDto {
  filters: UserQueryFilters;
}

export type GetUsersListResponseDto = UserBasicDto[];
