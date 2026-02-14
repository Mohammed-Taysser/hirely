import { getUsersFilter } from '@dist/modules/user/presentation/user.utils';

describe('user.utils', () => {
  it('builds filters from parsed query', () => {
    const request = {
      parsedQuery: {
        name: 'John',
        email: 'john@example.com',
        createdAt: {
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-01-31T00:00:00.000Z'),
        },
      },
    };

    const filters = getUsersFilter(request as never);

    expect(filters.name).toBe('John');
    expect(filters.email).toBe('john@example.com');
    expect(filters.createdAt).toBeDefined();
  });

  it('returns empty filters when query is empty', () => {
    const request = { parsedQuery: {} };
    const filters = getUsersFilter(request as never);

    expect(filters).toEqual({});
  });
});
