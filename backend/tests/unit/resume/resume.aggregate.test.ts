import { Resume } from '@dist/modules/resume/domain/resume.aggregate';
import { ResumeName } from '@dist/modules/resume/domain/value-objects/resume-name.vo';

const buildResumeData = () => ({
  meta: { title: 'Resume Title', language: 'en' },
  sections: {
    summary: {
      type: 'summary',
      content: { text: 'Summary text' },
    },
  },
});

describe('Resume aggregate', () => {
  it('creates resume with defaults', () => {
    const nameResult = ResumeName.create('My Resume');
    if (nameResult.isFailure) {
      throw new Error('Failed to create resume name');
    }

    const result = Resume.create({
      name: nameResult.getValue(),
      data: buildResumeData(),
      templateId: 'classic',
      userId: 'user-1',
    });

    expect(result.isSuccess).toBe(true);
    const resume = result.getValue();
    expect(resume.templateId).toBe('classic');
    expect(resume.templateVersion).toBeUndefined();
    expect(resume.createdAt).toBeInstanceOf(Date);
    expect(resume.updatedAt).toBeInstanceOf(Date);
  });

  it('updates mutable fields', () => {
    const nameResult = ResumeName.create('My Resume');
    if (nameResult.isFailure) {
      throw new Error('Failed to create resume name');
    }

    const result = Resume.create(
      {
        name: nameResult.getValue(),
        data: buildResumeData(),
        templateId: 'classic',
        templateVersion: null,
        themeConfig: null,
        userId: 'user-1',
      },
      'resume-1'
    );

    const resume = result.getValue();

    const updatedNameResult = ResumeName.create('Updated Resume');
    if (updatedNameResult.isFailure) {
      throw new Error('Failed to create updated resume name');
    }

    resume.rename(updatedNameResult.getValue());
    resume.updateData({
      ...buildResumeData(),
      meta: { title: 'Updated', language: 'en' },
    });
    resume.changeTemplate('modern', 'v2');
    resume.updateTheme({ accentColor: '#111111' });

    expect(resume.name.value).toBe('Updated Resume');
    expect(resume.data.meta.title).toBe('Updated');
    expect(resume.templateId).toBe('modern');
    expect(resume.templateVersion).toBe('v2');
    expect(resume.themeConfig).toEqual({ accentColor: '#111111' });
  });
});
