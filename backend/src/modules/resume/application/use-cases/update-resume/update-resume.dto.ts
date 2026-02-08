import { ResumeData } from '@hirely/resume-core';
import { ResumeFullDto } from '@/modules/resume/application/repositories/resume.query.repository.interface';

export interface UpdateResumeRequestDto {
  resumeId: string;
  userId: string; // To ensure ownership
  name?: string;
  data?: ResumeData;
  templateId?: string;
  templateVersion?: string;
  themeConfig?: unknown;
}

export type UpdateResumeResponseDto = ResumeFullDto;
