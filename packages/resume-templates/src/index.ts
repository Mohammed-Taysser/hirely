import type { ResumeViewModel } from "@hirely/resume-core";
import { artisticTemplate } from "./templates/artistic";
import { basicTemplate } from "./templates/basic";
import { blueprintTemplate } from "./templates/blueprint";
import { businessTemplate } from "./templates/business";
import { classicTemplate } from "./templates/classic";
import { casualTemplate } from "./templates/casual";
import { corporateTemplate } from "./templates/corporate";
import { crativeTemplate } from "./templates/crative";
import { elegantTemplate } from "./templates/elegant";
import { gradientTemplate } from "./templates/gradient";
import { minimalistTemplate } from "./templates/minimalist";
import { modernTemplate } from "./templates/modern";
import { nordicTemplate } from "./templates/nordic";
import { professionalTemplate } from "./templates/professional";
import { retroTemplate } from "./templates/retro";
import { technicalTemplate } from "./templates/technical";
import type { TemplateDefinition, TemplateThemeConfig } from "./types";

export type { TemplateDefinition, TemplateThemeConfig } from "./types";

export type RenderResumeHtmlOptions = {
  templateId?: string;
  themeConfig?: Partial<TemplateThemeConfig>;
};

const registry: Record<string, TemplateDefinition> = {
  [artisticTemplate.id]: artisticTemplate,
  [basicTemplate.id]: basicTemplate,
  [blueprintTemplate.id]: blueprintTemplate,
  [businessTemplate.id]: businessTemplate,
  [casualTemplate.id]: casualTemplate,
  [classicTemplate.id]: classicTemplate,
  [corporateTemplate.id]: corporateTemplate,
  [crativeTemplate.id]: crativeTemplate,
  [elegantTemplate.id]: elegantTemplate,
  [gradientTemplate.id]: gradientTemplate,
  [minimalistTemplate.id]: minimalistTemplate,
  [modernTemplate.id]: modernTemplate,
  [nordicTemplate.id]: nordicTemplate,
  [professionalTemplate.id]: professionalTemplate,
  [retroTemplate.id]: retroTemplate,
  [technicalTemplate.id]: technicalTemplate,
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
