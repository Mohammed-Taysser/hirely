import { Prisma } from '@generated-prisma';

import prisma from '@/apps/prisma';
import { toDateTimeFilter } from '@/modules/shared/infrastructure/prisma/filters';
import userSelect from '@/modules/shared/infrastructure/prisma-select/user.select';
import {
  UserAuthDto,
  IUserQueryRepository,
  UserBasicDto,
  UserFullDto,
  UserQueryFilters,
} from '@/modules/user/application/repositories/user.query.repository.interface';

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

  async findAuthByEmail(email: string): Promise<UserAuthDto | null> {
    return prisma.user
      .findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
        },
      })
      .then((user) => {
        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          passwordHash: user.password,
        };
      });
  }

  async findById(id: string): Promise<UserFullDto | null> {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect.full,
    });
  }
}
