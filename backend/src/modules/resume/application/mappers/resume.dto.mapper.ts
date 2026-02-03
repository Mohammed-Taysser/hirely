import { Resume } from '../../domain/resume.aggregate';
import { ResumeDto } from '../resume.dto';

export class ResumeDtoMapper {
  public static toResponse(resume: Resume): ResumeDto {
    return {
      id: resume.id,
      name: resume.name.value,
      data: resume.data,
      templateId: resume.templateId,
      templateVersion: resume.templateVersion,
      themeConfig: resume.themeConfig,
      userId: resume.userId,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    };
  }
}
