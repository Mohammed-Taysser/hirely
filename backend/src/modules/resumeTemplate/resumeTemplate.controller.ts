import { Request, Response } from 'express';

import resumeTemplateService from './resumeTemplate.service';

import responseService from '@/modules/shared/services/response.service';

class ResumeTemplateController {
  getResumeTemplates = async (req: Request, res: Response) => {
    const templates = resumeTemplateService.listTemplates();

    return responseService.success(res, {
      data: templates,
    });
  };
}

export default new ResumeTemplateController();
