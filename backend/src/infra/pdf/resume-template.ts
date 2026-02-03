import { buildResumeViewModel, type ResumeData } from '@hirely/resume-core';
import {
  renderResumeHtml as renderTemplateHtml,
  type RenderResumeHtmlOptions,
} from '@hirely/resume-templates';

export const renderResumeHtml = (data: unknown, options: RenderResumeHtmlOptions = {}) => {
  const resumeData = data as ResumeData;
  const viewModel = buildResumeViewModel(resumeData);
  return renderTemplateHtml(viewModel, options);
};
