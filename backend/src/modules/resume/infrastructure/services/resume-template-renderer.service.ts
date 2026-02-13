import { buildResumeViewModel, ResumeData } from '@hirely/resume-core';
import { renderResumeHtml as renderTemplateHtml } from '@hirely/resume-templates';

import {
  IResumeTemplateRenderer,
  ResumeTemplateRenderOptions,
} from '@/modules/resume/application/services/resume-template-renderer.service.interface';

export class ResumeTemplateRenderer implements IResumeTemplateRenderer {
  renderHtml(data: ResumeData, options: ResumeTemplateRenderOptions = {}): string {
    const viewModel = buildResumeViewModel(data);
    return renderTemplateHtml(viewModel, {
      templateId: options.templateId,
      themeConfig: options.themeConfig,
    });
  }
}
