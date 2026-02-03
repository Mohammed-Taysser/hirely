import type { ResumeViewModel } from "@hirely/resume-core";
import { classicTemplate } from "./templates/classic";
import { minimalistTemplate } from "./templates/minimalist";
import { modernTemplate } from "./templates/modern";
import type { TemplateDefinition, TemplateThemeConfig } from "./types";

export type { TemplateDefinition, TemplateThemeConfig } from "./types";

export type RenderResumeHtmlOptions = {
  templateId?: string;
  themeConfig?: Partial<TemplateThemeConfig>;
};

const registry: Record<string, TemplateDefinition> = {
  [classicTemplate.id]: classicTemplate,
  [minimalistTemplate.id]: minimalistTemplate,
  [modernTemplate.id]: modernTemplate,
};

export function listTemplates(): Array<{
  id: string;
  name: string;
  description: string;
  version: string;
  isDeprecated?: boolean;
}> {
  return Object.values(registry).map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    version: template.version,
    isDeprecated: template.isDeprecated,
  }));
}

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return registry[id];
}

export function renderResumeHtml(
  viewModel: ResumeViewModel,
  options: RenderResumeHtmlOptions = {},
): string {
  const templateId = options.templateId ?? classicTemplate.id;
  const template = registry[templateId] ?? classicTemplate;

  const theme: TemplateThemeConfig = {
    ...template.defaultThemeConfig,
    ...(options.themeConfig ?? {}),
  };

  return template.renderHtml(viewModel, theme);
}
