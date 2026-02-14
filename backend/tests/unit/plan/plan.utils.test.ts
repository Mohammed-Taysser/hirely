import { getPlansFilter } from '@dist/modules/plan/presentation/plan.utils';

describe('plan.utils', () => {
  it('builds filters from parsed query', () => {
    const request = {
      parsedQuery: {
        code: 'FREE',
        name: 'Free',
        createdAt: {
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-01-31T00:00:00.000Z'),
        },
      },
    };

    const filters = getPlansFilter(request as never);

    expect(filters.code).toBe('FREE');
    expect(filters.name).toBe('Free');
    expect(filters.createdAt).toBeDefined();
  });

  it('returns empty filters when query is empty', () => {
    const request = { parsedQuery: {} };
    const filters = getPlansFilter(request as never);

    expect(filters).toEqual({});
  });
});
