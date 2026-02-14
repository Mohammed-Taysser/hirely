import resumeDTO from '@dist/modules/resume/presentation/resume.dto';

const buildResumeData = (sectionsCount: number) => {
  const sections: Record<string, { type: 'summary'; content: { text: string } }> = {};

  for (let index = 0; index < sectionsCount; index += 1) {
    sections[`section-${index}`] = {
      type: 'summary',
      content: { text: `Summary ${index}` },
    };
  }

  return {
    meta: { title: 'Resume Title', language: 'en' },
    sections,
  };
};

describe('resume.dto validation', () => {
  it('rejects payload exceeding MAX_RESUME_SECTIONS in create schema', () => {
    const maxSections = Number(process.env.MAX_RESUME_SECTIONS ?? 20);
    const oversized = maxSections + 1;

    expect(() =>
      resumeDTO.createResume.body.parse({
        name: 'My Resume',
        templateId: 'classic',
        data: buildResumeData(oversized),
      })
    ).toThrow(`Max sections per resume is ${maxSections}`);
  });

  it('accepts payload at MAX_RESUME_SECTIONS in update schema', () => {
    const maxSections = Number(process.env.MAX_RESUME_SECTIONS ?? 20);

    expect(() =>
      resumeDTO.updateResume.body.parse({
        data: buildResumeData(maxSections),
      })
    ).not.toThrow();
  });

  it('rejects experience section when endDate is before startDate', () => {
    expect(() =>
      resumeDTO.createResume.body.parse({
        name: 'My Resume',
        templateId: 'classic',
        data: {
          meta: { title: 'Resume Title', language: 'en' },
          sections: {
            exp1: {
              type: 'experience',
              content: {
                company: 'ACME',
                role: 'Engineer',
                startDate: '2026-02-01',
                endDate: '2026-01-01',
              },
            },
          },
        },
      })
    ).toThrow('endDate must be after startDate');
  });

  it('rejects empty update payload', () => {
    expect(() => resumeDTO.updateResume.body.parse({})).toThrow('At least one field must be provided');
  });

  it('accepts experience section when endDate is after startDate', () => {
    expect(() =>
      resumeDTO.createResume.body.parse({
        name: 'My Resume',
        templateId: 'classic',
        data: {
          meta: { title: 'Resume Title', language: 'en' },
          sections: {
            exp1: {
              type: 'experience',
              content: {
                company: 'ACME',
                role: 'Engineer',
                startDate: '2026-01-01',
                endDate: '2026-02-01',
              },
            },
          },
        },
      })
    ).not.toThrow();
  });

  it('accepts experience section when endDate is omitted', () => {
    expect(() =>
      resumeDTO.createResume.body.parse({
        name: 'My Resume',
        templateId: 'classic',
        data: {
          meta: { title: 'Resume Title', language: 'en' },
          sections: {
            exp1: {
              type: 'experience',
              content: {
                company: 'ACME',
                role: 'Engineer',
                startDate: '2026-01-01',
              },
            },
          },
        },
      })
    ).not.toThrow();
  });

  it('rejects create payload with unknown templateId', () => {
    expect(() =>
      resumeDTO.createResume.body.parse({
        name: 'My Resume',
        templateId: 'unknown-template',
        data: buildResumeData(1),
      })
    ).toThrow('Invalid templateId');
  });

  it('rejects update payload with unknown templateId', () => {
    expect(() =>
      resumeDTO.updateResume.body.parse({
        templateId: 'unknown-template',
      })
    ).toThrow('Invalid templateId');
  });
});
