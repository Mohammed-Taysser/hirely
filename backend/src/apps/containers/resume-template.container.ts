import { resumeTemplateService } from '@/apps/container.shared';
import { GetResumeTemplatesUseCase } from '@/modules/resumeTemplate/application/use-cases/get-resume-templates/get-resume-templates.use-case';

const getResumeTemplatesUseCase = new GetResumeTemplatesUseCase(resumeTemplateService);

const resumeTemplateContainer = {
  getResumeTemplatesUseCase,
};

export { resumeTemplateContainer };
