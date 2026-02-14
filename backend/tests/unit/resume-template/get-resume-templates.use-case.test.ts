import { UnexpectedError } from '@dist/modules/shared/application/app-error';
import { GetResumeTemplatesUseCase } from '@dist/modules/resumeTemplate/application/use-cases/get-resume-templates/get-resume-templates.use-case';

describe('GetResumeTemplatesUseCase', () => {
  it('returns templates list', async () => {
    const resumeTemplateService = {
      listTemplates: jest.fn().mockReturnValue([
        { id: 'classic', name: 'Classic', description: 'Classic template' },
      ]),
      getTemplateById: jest.fn(),
    };

    const useCase = new GetResumeTemplatesUseCase(resumeTemplateService);
    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toHaveLength(1);
    expect(resumeTemplateService.listTemplates).toHaveBeenCalledTimes(1);
  });

  it('returns unexpected error when service throws', async () => {
    const resumeTemplateService = {
      listTemplates: jest.fn(() => {
        throw new Error('template failed');
      }),
      getTemplateById: jest.fn(),
    };

    const useCase = new GetResumeTemplatesUseCase(resumeTemplateService);
    const result = await useCase.execute();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnexpectedError);
  });
});
