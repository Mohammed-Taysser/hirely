import { UserEmail } from '@dist/modules/user/domain/value-objects/user-email.vo';

describe('UserEmail', () => {
  it('creates valid email and trims spaces', () => {
    const result = UserEmail.create('  user@example.com  ');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().value).toBe('user@example.com');
  });

  it('fails for malformed emails', () => {
    expect(UserEmail.create('invalid').isFailure).toBe(true);
    expect(UserEmail.create('user@').isFailure).toBe(true);
    expect(UserEmail.create('@example.com').isFailure).toBe(true);
    expect(UserEmail.create('user@example..com').isFailure).toBe(true);
  });

  it('fails for domains with bad label formatting', () => {
    expect(UserEmail.create('user@.example.com').isFailure).toBe(true);
    expect(UserEmail.create('user@example.com.').isFailure).toBe(true);
    expect(UserEmail.create('user@example').isFailure).toBe(true);
    expect(UserEmail.create('user@exa..mple.com').isFailure).toBe(true);
  });

  it('fails for emails containing spaces', () => {
    expect(UserEmail.create('user @example.com').isFailure).toBe(true);
    expect(UserEmail.create('user@exam ple.com').isFailure).toBe(true);
  });
});
