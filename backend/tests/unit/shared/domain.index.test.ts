describe('shared/domain index', () => {
  it('exports expected members in normal runtime', () => {
    jest.resetModules();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const domain = require('@dist/modules/shared/domain');

    expect(domain.Result).toBeDefined();
    expect(domain.Entity).toBeDefined();
    expect(domain.ValueObject).toBeDefined();
    expect(domain.AggregateRoot).toBeDefined();
  });

  it('supports CommonJS export fallback branch when Object.create is unavailable', () => {
    jest.resetModules();

    const originalCreate = Object.create;

    try {
      Object.defineProperty(Object, 'create', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const domain = require('@dist/modules/shared/domain');
        expect(domain.Result).toBeDefined();
        expect(domain.Entity).toBeDefined();
      });
    } finally {
      Object.defineProperty(Object, 'create', {
        value: originalCreate,
        configurable: true,
        writable: true,
      });
    }
  });
});
