import { Prisma } from '@generated-prisma';

import userSelect from '../shared/prisma-select/user.select';

import prisma from '@/apps/prisma';

class AuthService {
  findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data, select: userSelect.full });
  }
}

export default new AuthService();
