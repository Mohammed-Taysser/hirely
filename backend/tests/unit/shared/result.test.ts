import { Result } from '@dist/modules/shared/domain/result';

describe('Result', () => {
  it('creates a successful result with value', () => {
    const result = Result.ok('ok');

    expect(result.isSuccess).toBe(true);
    expect(result.isFailure).toBe(false);
    expect(result.getValue()).toBe('ok');
  });

  it('creates a failed result with error', () => {
    const result = Result.fail('boom');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('boom');
  });

  it('throws when retrieving value from failed result', () => {
    const result = Result.fail('boom');

    expect(() => result.getValue()).toThrow('Cant retrieve the value from a failed result');
  });

  it('combines and returns first failed result', () => {
    const fail = Result.fail('failed');
    const combined = Result.combine([Result.ok('a'), fail, Result.ok('b')]);

    expect(combined).toBe(fail);
  });

  it('combines successful results into ok', () => {
    const combined = Result.combine([Result.ok('a'), Result.ok('b')]);

    expect(combined.isSuccess).toBe(true);
  });

  it('throws when creating invalid success result with error', () => {
    expect(() => {
      // Runtime constructor visibility in JS allows this invariant test.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (Result as any)(true, 'error', 'value');
    }).toThrow('InvalidOperation: A result cannot be successful and contain an error');
  });

  it('throws when creating invalid failed result without error', () => {
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (Result as any)(false, null, null);
    }).toThrow('InvalidOperation: A failing result must contain an error message');
  });
});
