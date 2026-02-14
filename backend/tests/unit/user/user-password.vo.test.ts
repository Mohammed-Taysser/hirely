import { UserPassword } from '@dist/modules/user/domain/value-objects/user-password.vo';

describe('UserPassword', () => {
  it('creates raw password when length is valid', () => {
    const result = UserPassword.create('12345678');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().isHashed).toBe(false);
  });

  it('fails for short raw password', () => {
    const result = UserPassword.create('short');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Password must be at least 8 characters long');
  });

  it('allows short password when marked as hashed', () => {
    const result = UserPassword.create('hash', true);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().isHashed).toBe(true);
  });
});
