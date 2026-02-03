import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/user.aggregate';
import { UserEmail } from '../../domain/value-objects/user-email.vo';

import { UserMapper } from './user.mapper';

import prisma from '@/apps/prisma';
import { DomainEvents } from '@/modules/shared/domain/events/domain-events';

export class PrismaUserRepository implements IUserRepository {
  async exists(email: UserEmail): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email: email.value },
    });
    return !!user;
  }

  async save(user: User): Promise<void> {
    const raw = UserMapper.toPersistence(user);

    await prisma.user.upsert({
      where: { id: user.id },
      update: raw,
      create: raw,
    });

    await DomainEvents.dispatchEventsForAggregate(user.id);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  async findByEmail(email: UserEmail): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.value },
    });

    if (!user) return null;

    return UserMapper.toDomain(user);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}
