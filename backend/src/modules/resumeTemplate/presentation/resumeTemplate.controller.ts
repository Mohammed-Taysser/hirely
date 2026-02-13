import { Request, Response } from 'express';

import { resumeTemplateContainer } from '@/apps/container';
import { mapAppErrorToHttp } from '@/modules/shared/presentation/app-error.mapper';
import responseService from '@/modules/shared/presentation/response.service';

const { getResumeTemplatesUseCase } = resumeTemplateContainer;

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
