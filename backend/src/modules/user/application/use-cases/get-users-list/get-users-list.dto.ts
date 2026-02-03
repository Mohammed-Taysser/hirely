import { Prisma } from '@generated-prisma';

import { UserBasicDto } from '../../repositories/user.query.repository.interface';

export interface GetUsersListRequestDto {
  filters: Prisma.UserWhereInput;
}

export type GetUsersListResponseDto = UserBasicDto[];
