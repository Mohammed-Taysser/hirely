import {
  getResumeExportsFilter,
  getResumesFilter,
  getResumeSnapshotsFilter,
} from '@dist/modules/resume/presentation/resume.utils';

describe('resume.utils', () => {
  it('builds resumes filter with user and createdAt range', () => {
    const request = {
      user: { id: 'user-1' },
      parsedQuery: {
        createdAt: {
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-01-31T00:00:00.000Z'),
        },
      },
    };

    const filters = getResumesFilter(request as never);

    expect(filters.userId).toBe('user-1');
    expect(filters.createdAt).toEqual({
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    });
    expect((filters.createdAt?.startDate as Date).getTime()).toBeLessThanOrEqual(
      (filters.createdAt?.endDate as Date).getTime()
    );
  });

  it('builds snapshot filter with ids and optional date range', () => {
    const request = {
      user: { id: 'user-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedQuery: {
        createdAt: {
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-01-31T00:00:00.000Z'),
        },
      },
    };

    const filters = getResumeSnapshotsFilter(request as never);

    expect(filters).toEqual({
      userId: 'user-1',
      resumeId: 'resume-1',
      createdAt: {
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      },
    });
    expect((filters.createdAt?.startDate as Date).getTime()).toBeLessThanOrEqual(
      (filters.createdAt?.endDate as Date).getTime()
    );
  });

  it('builds export filter with status and without createdAt', () => {
    const request = {
      user: { id: 'user-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedQuery: {
        status: 'DONE',
      },
    };

    const filters = getResumeExportsFilter(request as never);

    expect(filters).toEqual({
      userId: 'user-1',
      resumeId: 'resume-1',
      status: 'DONE',
    });
  });

  it('builds export filter with createdAt range', () => {
    const request = {
      user: { id: 'user-1' },
      parsedParams: { resumeId: 'resume-1' },
      parsedQuery: {
        createdAt: {
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-01-31T00:00:00.000Z'),
        },
      },
    };

    const filters = getResumeExportsFilter(request as never);

    expect(filters).toEqual({
      userId: 'user-1',
      resumeId: 'resume-1',
      createdAt: {
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      },
    });
    expect((filters.createdAt?.startDate as Date).getTime()).toBeLessThanOrEqual(
      (filters.createdAt?.endDate as Date).getTime()
    );
  });
});
