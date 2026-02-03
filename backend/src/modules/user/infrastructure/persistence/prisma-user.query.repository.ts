import { Prisma } from '@generated-prisma';

import userSelect from '@/modules/shared/prisma-select/user.select';
import prisma from '@/apps/prisma';
import {
  IUserQueryRepository,
  UserBasicDto,
  UserFullDto,
} from '@/modules/user/application/repositories/user.query.repository.interface';

export class PrismaUserQueryRepository implements IUserQueryRepository {
  async getPaginatedUsers(
    page: number,
    limit: number,
    filters: Prisma.UserWhereInput
  ): Promise<[UserFullDto[], number]> {
    const skip = (page - 1) * limit;

    return prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        where: filters,
        select: userSelect.full,
      }),
      prisma.user.count({ where: filters }),
    ]);
  }

  async getBasicUsers(filters: Prisma.UserWhereInput): Promise<UserBasicDto[]> {
    return prisma.user.findMany({ select: userSelect.basic, where: filters });
  }

  async findById(id: string): Promise<UserFullDto | null> {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect.full,
    });
  }
}
