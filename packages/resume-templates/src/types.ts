import type { ResumeViewModel } from "@hirely/resume-core";

export type TemplateThemeConfig = {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: string;
};

export type TemplateDefinition = {
  id: string;
  name: string;
  description: string;
  version: string;
  isDeprecated?: boolean;
  defaultThemeConfig: TemplateThemeConfig;
  renderHtml: (
    viewModel: ResumeViewModel,
    themeConfig?: TemplateThemeConfig,
  ) => string;
};
