import { Prisma } from '@generated-prisma';

import userSelect from '../shared/prisma-select/user.select';

import prisma from '@/apps/prisma';

class UserService {
  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: userSelect.full });
  }

  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, select: userSelect.full });
  }

  getPaginatedUsers(page: number, limit: number, filters: Prisma.UserWhereInput) {
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

  getBasicUsers(filters: Prisma.UserWhereInput) {
    return prisma.user.findMany({ select: userSelect.basic, where: filters });
  }

  createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, select: userSelect.full });
  }

  updateUser(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data, select: userSelect.full });
  }

  deleteUserById(id: string) {
    return prisma.user.delete({ where: { id }, select: userSelect.full });
  }
}

export default new UserService();
