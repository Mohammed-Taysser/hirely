export interface DeleteResumeRequestDto {
  resumeId: string;
  userId: string;
}

import { ResumeData } from '@hirely/resume-core';

export interface DeleteResumeResponseDto {
  id: string;
  name: string;
  data: ResumeData;
  templateId: string;
  templateVersion?: string | null;
  themeConfig?: unknown;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
