import { ResumeData } from '@hirely/resume-core';

export interface ResumeTemplateRenderOptions {
  templateId?: string;
  themeConfig?: Record<string, unknown>;
}

export interface IResumeTemplateRenderer {
  renderHtml(data: ResumeData, options?: ResumeTemplateRenderOptions): string;
}
