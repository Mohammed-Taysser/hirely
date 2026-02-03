import { listTemplates } from '@hirely/resume-templates';

class ResumeTemplateService {
  listTemplates() {
    return listTemplates();
  }
}

export default new ResumeTemplateService();
