import { ValueObject } from '@dist/modules/shared/domain/base/value-object.base';

class SampleValueObject extends ValueObject {
  constructor(value: string) {
    super({ value });
  }
}

describe('ValueObject base', () => {
  it('returns true when value objects have same props', () => {
    const left = new SampleValueObject('same');
    const right = new SampleValueObject('same');

    expect(left.equals(right)).toBe(true);
  });

  it('returns false when value objects differ', () => {
    const left = new SampleValueObject('a');
    const right = new SampleValueObject('b');

    expect(left.equals(right)).toBe(false);
  });

  it('returns false for null and undefined', () => {
    const left = new SampleValueObject('a');

    expect(left.equals(undefined)).toBe(false);
    expect(left.equals(null)).toBe(false);
  });

  it('returns false when compared object has undefined props', () => {
    const left = new SampleValueObject('a');
    const fake = { props: undefined };

    expect(left.equals(fake)).toBe(false);
  });
});
