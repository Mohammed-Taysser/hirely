import { Request, Response } from 'express';

import responseService from '@/modules/shared/services/response.service';
import { GetResumeTemplatesUseCase } from '@/modules/resumeTemplate/application/use-cases/get-resume-templates/get-resume-templates.use-case';
import { ResumeTemplateService } from '@/modules/resumeTemplate/infrastructure/services/resume-template.service';
import { mapAppErrorToHttp } from '@/modules/shared/application/app-error.mapper';

const resumeTemplateService = new ResumeTemplateService();
const getResumeTemplatesUseCase = new GetResumeTemplatesUseCase(resumeTemplateService);

class ResumeTemplateController {
  getResumeTemplates = async (req: Request, res: Response) => {
    const result = await getResumeTemplatesUseCase.execute();

    if (result.isFailure) {
      throw mapAppErrorToHttp(result.error);
    }

    return responseService.success(res, {
      data: result.getValue(),
    });
  };
}

export default new ResumeTemplateController();
