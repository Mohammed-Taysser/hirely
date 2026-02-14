import { User } from '@dist/modules/user/domain/user.aggregate';
import { UserEmail } from '@dist/modules/user/domain/value-objects/user-email.vo';
import { UserName } from '@dist/modules/user/domain/value-objects/user-name.vo';
import { UserPassword } from '@dist/modules/user/domain/value-objects/user-password.vo';
import { Result } from '@dist/modules/shared/domain/result';

const buildUserParts = () => {
  const emailResult = UserEmail.create('john@example.com');
  const nameResult = UserName.create('John Doe');
  const passwordResult = UserPassword.create('12345678');

  if (emailResult.isFailure || nameResult.isFailure || passwordResult.isFailure) {
    throw new Error('Failed to create user value objects for tests');
  }

  return {
    email: emailResult.getValue(),
    name: nameResult.getValue(),
    password: passwordResult.getValue(),
  };
};

describe('User aggregate', () => {
  it('creates user with default flags and timestamps', () => {
    const { email, name, password } = buildUserParts();

    const result = User.create({
      email,
      name,
      password,
      planId: 'plan-free',
      isVerified: false,
      isDeleted: false,
    });

    expect(result.isSuccess).toBe(true);

    const user = result.getValue();
    expect(user.isVerified).toBe(false);
    expect(user.isDeleted).toBe(false);
    expect(user.pendingPlanId).toBeNull();
    expect(user.pendingPlanAt).toBeNull();
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('registers user and appends user-created domain event', () => {
    const { email, name, password } = buildUserParts();

    const result = User.register({
      email,
      name,
      password,
      planId: 'plan-free',
    });

    expect(result.isSuccess).toBe(true);
    const user = result.getValue();
    expect(user.domainEvents).toHaveLength(1);
    expect(user.domainEvents[0].constructor.name).toBe('UserCreatedEvent');
    expect(user.domainEvents[0].getAggregateId()).toBe(user.id);
  });

  it('applies lifecycle operations', () => {
    const { email, name, password } = buildUserParts();
    const result = User.create({
      email,
      name,
      password,
      planId: 'plan-free',
      isVerified: false,
      isDeleted: false,
    });
    const user = result.getValue();

    user.schedulePlanChange('plan-pro', new Date('2026-12-01T00:00:00.000Z'));
    expect(user.pendingPlanId).toBe('plan-pro');
    expect(user.pendingPlanAt?.toISOString()).toBe('2026-12-01T00:00:00.000Z');

    user.changePlan('plan-pro');
    expect(user.planId).toBe('plan-pro');
    expect(user.pendingPlanId).toBeNull();
    expect(user.pendingPlanAt).toBeNull();

    const newNameResult = UserName.create('Jane Doe');
    const newEmailResult = UserEmail.create('jane@example.com');
    if (newNameResult.isFailure || newEmailResult.isFailure) {
      throw new Error('Failed to create update value objects for tests');
    }

    user.updateName(newNameResult.getValue());
    user.updateEmail(newEmailResult.getValue());
    user.markAsVerified();
    user.delete();

    expect(user.name.value).toBe('Jane Doe');
    expect(user.email.value).toBe('jane@example.com');
    expect(user.isVerified).toBe(true);
    expect(user.isDeleted).toBe(true);
  });

  it('preserves explicit optional values passed to create', () => {
    const { email, name, password } = buildUserParts();
    const createdAt = new Date('2025-01-01T00:00:00.000Z');
    const updatedAt = new Date('2025-01-02T00:00:00.000Z');
    const pendingPlanAt = new Date('2025-02-01T00:00:00.000Z');

    const result = User.create({
      email,
      name,
      password,
      planId: 'plan-free',
      pendingPlanId: 'plan-pro',
      pendingPlanAt,
      isVerified: true,
      isDeleted: true,
      createdAt,
      updatedAt,
    });

    expect(result.isSuccess).toBe(true);
    const user = result.getValue();
    expect(user.pendingPlanId).toBe('plan-pro');
    expect(user.pendingPlanAt?.toISOString()).toBe('2025-02-01T00:00:00.000Z');
    expect(user.createdAt?.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    expect(user.updatedAt?.toISOString()).toBe('2025-01-02T00:00:00.000Z');
    expect(user.isVerified).toBe(true);
    expect(user.isDeleted).toBe(true);
  });

  it('falls back to default flags when isVerified/isDeleted are undefined', () => {
    const { email, name, password } = buildUserParts();

    const result = User.create({
      email,
      name,
      password,
      planId: 'plan-free',
      isVerified: undefined as unknown as boolean,
      isDeleted: undefined as unknown as boolean,
    });

    expect(result.isSuccess).toBe(true);
    const user = result.getValue();
    expect(user.isVerified).toBe(false);
    expect(user.isDeleted).toBe(false);
    expect(user.password.value).toBe('12345678');
  });

  it('register returns failure when underlying create fails', () => {
    const { email, name, password } = buildUserParts();
    const createSpy = jest.spyOn(User, 'create').mockImplementationOnce(() => {
      return Result.fail('create failed');
    });

    const result = User.register({
      email,
      name,
      password,
      planId: 'plan-free',
    });

    expect(result.isFailure).toBe(true);
    createSpy.mockRestore();
  });
});
