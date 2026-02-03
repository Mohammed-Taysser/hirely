export interface ResumeTemplateListItem {
  id: string;
  name: string;
  version?: string;
}

export interface IResumeTemplateService {
  listTemplates(): ResumeTemplateListItem[];
}
