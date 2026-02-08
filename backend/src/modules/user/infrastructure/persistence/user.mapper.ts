import { User as PrismaUser } from '@generated-prisma';

import { User } from '../../domain/user.aggregate';
import { UserEmail } from '../../domain/value-objects/user-email.vo';
import { UserName } from '../../domain/value-objects/user-name.vo';
import { UserPassword } from '../../domain/value-objects/user-password.vo';

export class UserMapper {
  public static toDomain(raw: PrismaUser): User {
    const userEmailOrError = UserEmail.create(raw.email);
    const userNameOrError = UserName.create(raw.name);
    const userPasswordOrError = UserPassword.create(raw.password, true); // It's already hashed in DB

    const userOrError = User.create(
      {
        email: userEmailOrError.getValue(),
        name: userNameOrError.getValue(),
        password: userPasswordOrError.getValue(),
        planId: raw.planId,
        pendingPlanId: raw.pendingPlanId,
        pendingPlanAt: raw.pendingPlanAt,
        isVerified: raw.isVerified,
        isDeleted: raw.isDeleted,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id
    );

    return userOrError.getValue();
  }

  public static toPersistence(user: User): PrismaUser {
    return {
      id: user.id,
      email: user.email.value,
      name: user.name.value,
      password: user.password.value,
      planId: user.planId,
      pendingPlanId: user.pendingPlanId ?? null,
      pendingPlanAt: user.pendingPlanAt ?? null,
      isVerified: user.isVerified,
      isDeleted: user.isDeleted,
      verificationToken: null,
      verificationTokenExpiresAt: null,
      resetToken: null,
      resetTokenExpiresAt: null,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };
  }
}
