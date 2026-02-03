import resumeTemplateService from '@/modules/resumeTemplate/resumeTemplate.service';
import {
  IResumeTemplateService,
  ResumeTemplateListItem,
} from '@/modules/resumeTemplate/application/services/resume-template.service.interface';

export class ResumeTemplateService implements IResumeTemplateService {
  listTemplates(): ResumeTemplateListItem[] {
    return resumeTemplateService.listTemplates();
  }
}
