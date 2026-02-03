import { UnexpectedError } from '@/modules/shared/application/app-error';
import { UseCase } from '@/modules/shared/application/use-case.interface';
import { Result } from '@/modules/shared/domain';
import {
  IResumeTemplateService,
  ResumeTemplateListItem,
} from '@/modules/resumeTemplate/application/services/resume-template.service.interface';

type GetResumeTemplatesResponse = Result<ResumeTemplateListItem[], UnexpectedError>;

export class GetResumeTemplatesUseCase implements UseCase<void, GetResumeTemplatesResponse> {
  constructor(private readonly resumeTemplateService: IResumeTemplateService) {}

  public async execute(): Promise<GetResumeTemplatesResponse> {
    try {
      const templates = this.resumeTemplateService.listTemplates();
      return Result.ok(templates);
    } catch (err) {
      return Result.fail(new UnexpectedError(err));
    }
  }
}
