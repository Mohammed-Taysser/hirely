import {
  buildMissingRequiredSectionsErrorMessage,
  getMissingRequiredSections,
  getRequiredSectionsForTemplate,
  getResumeSectionTypes,
  hasRequiredSectionsForTemplate,
} from '@dist/modules/resume/application/policies/resume-template-sections.policy';

const buildResumeData = (sectionTypes: Array<'summary' | 'experience'>) => ({
  meta: { title: 'Resume Title', language: 'en' },
  sections: Object.fromEntries(
    sectionTypes.map((type, index) => {
      if (type === 'summary') {
        return [
          `section-${index}`,
          {
            type: 'summary',
            content: { text: `Summary ${index}` },
          },
        ];
      }

      return [
        `section-${index}`,
        {
          type: 'experience',
          content: { company: `Company ${index}`, role: `Role ${index}` },
        },
      ];
    })
  ),
});

describe('resume-template-sections.policy', () => {
  it('returns required sections for known templates', () => {
    expect(getRequiredSectionsForTemplate('classic')).toEqual(['summary']);
    expect(getRequiredSectionsForTemplate('modern')).toEqual(['summary']);
    expect(getRequiredSectionsForTemplate('minimalist')).toEqual(['summary']);
  });

  it('returns empty required sections for unknown template', () => {
    expect(getRequiredSectionsForTemplate('custom-template')).toEqual([]);
  });

  it('extracts unique section types from resume data', () => {
    const data = buildResumeData(['summary', 'summary', 'experience']);

    expect(Array.from(getResumeSectionTypes(data)).sort()).toEqual(['experience', 'summary']);
  });

  it('handles missing sections object safely', () => {
    const dataWithoutSections = {
      meta: { title: 'Resume Title', language: 'en' },
      sections: undefined,
    };

    expect(Array.from(getResumeSectionTypes(dataWithoutSections as never))).toEqual([]);
  });

  it('returns missing required sections for template', () => {
    const data = buildResumeData(['experience']);

    expect(getMissingRequiredSections('classic', data)).toEqual(['summary']);
    expect(hasRequiredSectionsForTemplate('classic', data)).toBe(false);
  });

  it('accepts templates when required sections are present', () => {
    const data = buildResumeData(['summary', 'experience']);

    expect(getMissingRequiredSections('classic', data)).toEqual([]);
    expect(hasRequiredSectionsForTemplate('classic', data)).toBe(true);
  });

  it('builds validation message for missing sections', () => {
    expect(buildMissingRequiredSectionsErrorMessage('classic', ['summary'])).toBe(
      'Template "classic" requires sections: summary'
    );
  });
});
