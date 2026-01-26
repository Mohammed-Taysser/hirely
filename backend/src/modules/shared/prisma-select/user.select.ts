import { Prisma } from '@generated-prisma';

class UserSelect {
  public basic = {
    id: true,
    name: true,
  } satisfies Prisma.UserSelect;

  public full = {
    ...this.basic,
    createdAt: true,
    updatedAt: true,
    email: true,
    planId: true,
    plan: {
      select: {
        id: true,
        code: true,
        name: true,
      },
    },
    name: true,
    isVerified: true,
    isDeleted: true,
    verificationToken: true,
    verificationTokenExpiresAt: true,
    resetToken: true,
    resetTokenExpiresAt: true,
    resumes: true,
  } satisfies Prisma.UserSelect;
}

export default new UserSelect();
