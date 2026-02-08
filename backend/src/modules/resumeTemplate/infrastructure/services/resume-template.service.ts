import { listTemplates } from '@hirely/resume-templates';
import {
  IResumeTemplateService,
  ResumeTemplateListItem,
} from '@/modules/resumeTemplate/application/services/resume-template.service.interface';

export class ResumeTemplateService implements IResumeTemplateService {
  listTemplates(): ResumeTemplateListItem[] {
    return listTemplates();
  }
}
