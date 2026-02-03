declare module '@hirely/resume-core' {
  export type ResumeData = Record<string, unknown>;

  export function buildResumeViewModel(data: ResumeData): Record<string, unknown>;
}

declare module '@hirely/resume-templates' {
  export interface RenderResumeHtmlOptions {
    templateId?: string;
    themeConfig?: Record<string, unknown>;
  }

  export function renderResumeHtml(
    viewModel: Record<string, unknown>,
    options?: RenderResumeHtmlOptions
  ): string;

  export function listTemplates(): Array<{ id: string; name: string; version?: string }>;
}
