import {
  buildResumeSectionsLimitErrorMessage,
  countResumeSections,
  exceedsResumeSectionsLimit,
} from '@dist/modules/resume/application/policies/resume-sections.policy';

describe('resume-sections.policy', () => {
  it('counts sections safely for empty values', () => {
    expect(countResumeSections(undefined)).toBe(0);
    expect(countResumeSections(null)).toBe(0);
    expect(countResumeSections({})).toBe(0);
  });

  it('counts provided sections', () => {
    expect(
      countResumeSections({
        summary: { type: 'summary' },
        experience: { type: 'experience' },
      })
    ).toBe(2);
  });

  it('checks max limit and builds message', () => {
    const sections = { one: {}, two: {}, three: {} };

    expect(exceedsResumeSectionsLimit(sections, 2)).toBe(true);
    expect(exceedsResumeSectionsLimit(sections, 3)).toBe(false);
    expect(buildResumeSectionsLimitErrorMessage(2)).toBe('Max sections per resume is 2');
  });
});
