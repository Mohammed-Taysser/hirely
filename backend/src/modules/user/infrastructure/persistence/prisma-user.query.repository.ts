import { Prisma } from '@generated-prisma';

import userSelect from '@/modules/shared/prisma-select/user.select';
import prisma from '@/apps/prisma';
import {
  IUserQueryRepository,
  UserBasicDto,
  UserFullDto,
  UserQueryFilters,
} from '@/modules/user/application/repositories/user.query.repository.interface';
import { toDateTimeFilter } from '@/modules/shared/infra/prisma/filters';

const buildUserFilters = (filters: UserQueryFilters): Prisma.UserWhereInput => {
  const where: Prisma.UserWhereInput = {};

  if (filters.name) {
    where.name = { contains: filters.name };
  }

  if (filters.email) {
    where.email = { contains: filters.email };
  }

  const createdAt = toDateTimeFilter(filters.createdAt);
  if (createdAt) {
    where.createdAt = createdAt;
  }

  return where;
};

export class PrismaUserQueryRepository implements IUserQueryRepository {
  async getPaginatedUsers(
    page: number,
    limit: number,
    filters: UserQueryFilters
  ): Promise<[UserFullDto[], number]> {
    const skip = (page - 1) * limit;
    const where = buildUserFilters(filters);

    return prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where,
        select: userSelect.full,
      }),
      prisma.user.count({ where }),
    ]);
  }

  async getBasicUsers(filters: UserQueryFilters): Promise<UserBasicDto[]> {
    const where = buildUserFilters(filters);
    return prisma.user.findMany({ select: userSelect.basic, where });
  }

  async findById(id: string): Promise<UserFullDto | null> {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect.full,
    });
  }
}
