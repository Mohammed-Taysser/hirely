import { ResumeName } from '@dist/modules/resume/domain/value-objects/resume-name.vo';

describe('ResumeName', () => {
  it('creates valid resume name and trims spaces', () => {
    const result = ResumeName.create('  Software Engineer Resume  ');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().value).toBe('Software Engineer Resume');
  });

  it('fails when resume name is empty after trim', () => {
    const result = ResumeName.create('   ');

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Resume name must be between 1 and 255 characters long');
  });
});
