import { Prisma } from '@generated-prisma';

import userSelect from '@/modules/shared/prisma-select/user.select';

export type UserBasicDto = Prisma.UserGetPayload<{ select: typeof userSelect.basic }>;
export type UserFullDto = Prisma.UserGetPayload<{ select: typeof userSelect.full }>;

export interface IUserQueryRepository {
  getPaginatedUsers(
    page: number,
    limit: number,
    filters: Prisma.UserWhereInput
  ): Promise<[UserFullDto[], number]>;
  getBasicUsers(filters: Prisma.UserWhereInput): Promise<UserBasicDto[]>;
}
