import { normalizeResumeData } from '@dist/modules/resume/presentation/resume-data.normalizer';

describe('resume-data.normalizer', () => {
  it('normalizes summary and experience sections with defaults', () => {
    const normalized = normalizeResumeData({
      meta: { title: 'Resume', language: null },
      sections: {
        s1: { type: 'summary', content: {} },
        s2: {
          type: 'experience',
          content: {
            company: 'ACME',
            role: 'Engineer',
          },
        },
      },
    } as never);

    expect(normalized).toEqual({
      meta: { title: 'Resume', language: null },
      sections: {
        s1: { type: 'summary', content: { text: '' } },
        s2: {
          type: 'experience',
          content: {
            company: 'ACME',
            role: 'Engineer',
            startDate: null,
            endDate: null,
          },
        },
      },
    });
  });

  it('keeps string dates and converts Date objects to iso strings', () => {
    const normalized = normalizeResumeData({
      meta: { title: 'Resume', language: 'en' },
      sections: {
        s1: {
          type: 'experience',
          content: {
            company: 'ACME',
            role: 'Engineer',
            startDate: new Date('2026-01-01T00:00:00.000Z'),
            endDate: '2026-02-01T00:00:00.000Z',
          },
        },
      },
    } as never);

    expect(normalized.sections.s1).toEqual({
      type: 'experience',
      content: {
        company: 'ACME',
        role: 'Engineer',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-02-01T00:00:00.000Z',
      },
    });
  });

  it('defaults missing company and role to empty strings for experience sections', () => {
    const normalized = normalizeResumeData({
      meta: { title: 'Resume', language: 'en' },
      sections: {
        s1: {
          type: 'experience',
          content: {},
        },
      },
    } as never);

    expect(normalized.sections.s1).toEqual({
      type: 'experience',
      content: {
        company: '',
        role: '',
        startDate: null,
        endDate: null,
      },
    });
  });
});
