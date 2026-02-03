import { UserCreatedEvent } from './events/user-created.event';
import { UserEmail } from './value-objects/user-email.vo';
import { UserName } from './value-objects/user-name.vo';
import { UserPassword } from './value-objects/user-password.vo';

import { AggregateRoot, Result } from '@/modules/shared/domain';

export interface UserProps {
  email: UserEmail;
  name: UserName;
  password: UserPassword;
  planId: string;
  isVerified: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends AggregateRoot<UserProps> {
  get email(): UserEmail {
    return this.props.email;
  }
  get name(): UserName {
    return this.props.name;
  }
  get password(): UserPassword {
    return this.props.password;
  }
  get planId(): string {
    return this.props.planId;
  }
  get isVerified(): boolean {
    return this.props.isVerified;
  }
  get isDeleted(): boolean {
    return this.props.isDeleted;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  public static create(props: UserProps, id?: string): Result<User> {
    const user = new User(
      {
        ...props,
        isVerified: props.isVerified ?? false,
        isDeleted: props.isDeleted ?? false,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id
    );

    return Result.ok(user);
  }

  public static register(
    props: Omit<UserProps, 'isVerified' | 'isDeleted' | 'createdAt' | 'updatedAt'>
  ): Result<User> {
    const userResult = User.create({
      ...props,
      isVerified: false,
      isDeleted: false,
    });

    if (userResult.isSuccess) {
      const user = userResult.getValue();
      user.addDomainEvent(new UserCreatedEvent(user));
    }

    return userResult;
  }

  public markAsVerified(): void {
    this.props.isVerified = true;
    this.props.updatedAt = new Date();
    // Add domain event: UserVerifiedEvent
  }

  public delete(): void {
    this.props.isDeleted = true;
    this.props.updatedAt = new Date();
  }

  public changePlan(newPlanId: string): void {
    this.props.planId = newPlanId;
    this.props.updatedAt = new Date();
  }

  public updateName(name: UserName): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  public updateEmail(email: UserEmail): void {
    this.props.email = email;
    this.props.updatedAt = new Date();
  }
}
