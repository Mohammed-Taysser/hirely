import { Prisma } from '@generated-prisma';

import { UserFullDto } from '../../repositories/user.query.repository.interface';

export interface GetUsersRequestDto {
  page: number;
  limit: number;
  filters: Prisma.UserWhereInput;
}

export interface GetUsersResponseDto {
  users: UserFullDto[];
  total: number;
}
