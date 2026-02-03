import { ResumeData } from '@hirely/resume-core';

export interface UpdateResumeRequestDto {
  resumeId: string;
  userId: string; // To ensure ownership
  name?: string;
  data?: ResumeData;
  templateId?: string;
  templateVersion?: string;
  themeConfig?: unknown;
}

export interface UpdateResumeResponseDto {
  id: string;
  name: string;
  data: ResumeData;
  templateId: string;
  templateVersion?: string | null;
  themeConfig?: unknown;
  updatedAt?: Date;
}
