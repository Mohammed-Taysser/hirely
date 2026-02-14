import { UserName } from '@dist/modules/user/domain/value-objects/user-name.vo';

describe('UserName', () => {
  it('creates valid name', () => {
    const result = UserName.create('  John Doe  ');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().value).toBe('John Doe');
  });

  it('fails when name is too short', () => {
    const result = UserName.create('A');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Name must be between 2 and 100 characters long');
  });
});
