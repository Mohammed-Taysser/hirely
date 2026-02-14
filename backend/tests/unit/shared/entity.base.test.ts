// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Entity } = require('@dist/modules/shared/domain/base/entity.base');

class SampleEntity extends Entity {
  constructor(props: { value: string }, id?: string) {
    super(props, id);
  }
}

describe('Entity base', () => {
  it('creates entity with provided id', () => {
    const entity = new SampleEntity({ value: 'x' }, 'entity-1');
    expect(entity.id).toBe('entity-1');
  });

  it('compares by id and reference', () => {
    const left = new SampleEntity({ value: 'a' }, 'same-id');
    const sameRef = left;
    const sameIdDifferentRef = new SampleEntity({ value: 'b' }, 'same-id');
    const differentId = new SampleEntity({ value: 'a' }, 'other-id');

    expect(left.equals(sameRef)).toBe(true);
    expect(left.equals(sameIdDifferentRef)).toBe(true);
    expect(left.equals(differentId)).toBe(false);
  });

  it('returns false when compared with nullish value', () => {
    const left = new SampleEntity({ value: 'a' }, 'entity-1');

    expect(left.equals(undefined)).toBe(false);
    expect(left.equals(null)).toBe(false);
  });
});
