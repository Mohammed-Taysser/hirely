describe('shared/domain index', () => {
  it('exports expected members in normal runtime', async () => {
    jest.resetModules();

    const domain = (await import('@dist/modules/shared/domain')) as unknown as Record<
      string,
      unknown
    >;

    expect(domain.Result).toBeDefined();
    expect(domain.Entity).toBeDefined();
    expect(domain.ValueObject).toBeDefined();
    expect(domain.AggregateRoot).toBeDefined();
  });

  it('supports CommonJS export fallback branch when Object.create is unavailable', async () => {
    jest.resetModules();

    const originalCreate = Object.create;

    try {
      Object.defineProperty(Object, 'create', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      await jest.isolateModulesAsync(async () => {
        const domain = (await import('@dist/modules/shared/domain')) as unknown as Record<
          string,
          unknown
        >;
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
