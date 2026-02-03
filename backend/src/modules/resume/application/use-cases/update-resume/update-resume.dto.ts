import { ResumeData } from '@hirely/resume-core';
import { ResumeDto } from '../../resume.dto';

export interface UpdateResumeRequestDto {
  resumeId: string;
  userId: string; // To ensure ownership
  name?: string;
  data?: ResumeData;
  templateId?: string;
  templateVersion?: string;
  themeConfig?: unknown;
}

export type UpdateResumeResponseDto = ResumeDto;
