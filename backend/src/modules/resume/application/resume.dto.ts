import { ResumeData } from '@hirely/resume-core';

export interface ResumeDto {
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
