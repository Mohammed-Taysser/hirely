import type { ResumeViewModel } from "@hirely/resume-core";

import type { TemplateDefinition, TemplateThemeConfig } from "../types";

type StyledTemplateConfig = {
  id: string;
  name: string;
  description: string;
  version?: string;
  defaultTheme: TemplateThemeConfig;
  summaryLabel?: string;
  experienceLabel?: string;
  dateSeparator?: string;
  style: {
    pageBackground: string;
    sheetBackground: string;
    sheetBorder: string;
    sheetShadow?: string;
    sheetRadius?: string;
    headerBackground: string;
    headerColor: string;
    sectionTitleColor: string;
    itemBackground: string;
    itemBorder: string;
    roleColor?: string;
    companyColor?: string;
    dateColor?: string;
  };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderSummary = (viewModel: ResumeViewModel): string =>
  viewModel.sections
    .filter((section) => section.type === "summary")
    .map((section) => `<p class="summary-text">${escapeHtml(section.text)}</p>`)
    .join("\n");

const renderExperience = (
  viewModel: ResumeViewModel,
  separator: string,
): string =>
  viewModel.sections
    .filter((section) => section.type === "experience")
    .map((section) => {
      const dates = [section.startDateLabel, section.endDateLabel]
        .filter(Boolean)
        .join(separator);

      return `
      <article class="experience-item">
        <div class="experience-top">
          <h3>${escapeHtml(section.role)}</h3>
          ${dates ? `<span class="experience-dates">${escapeHtml(dates)}</span>` : ""}
        </div>
        <div class="experience-company">${escapeHtml(section.company)}</div>
      </article>`;
    })
    .join("\n");

export const createStyledTemplate = (
  config: StyledTemplateConfig,
): TemplateDefinition => ({
  id: config.id,
  name: config.name,
  description: config.description,
  version: config.version ?? "1.0.0",
  defaultThemeConfig: config.defaultTheme,
  renderHtml(viewModel, theme = config.defaultTheme) {
    const { meta } = viewModel;
    const summaryBlocks = renderSummary(viewModel);
    const experienceBlocks = renderExperience(
      viewModel,
      config.dateSeparator ?? " - ",
    );

    return `<!doctype html>
<html lang="${meta.language ?? "en"}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(meta.title || "Resume")}</title>
  <style>
    :root {
      --primary-color: ${theme.primaryColor};
      --accent-color: ${theme.accentColor};
      --font-family: ${theme.fontFamily};
      --font-size: ${theme.fontSize};
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: var(--font-family);
      font-size: var(--font-size);
      color: var(--primary-color);
      background: ${config.style.pageBackground};
      padding: 28px;
      line-height: 1.5;
    }

    .sheet {
      background: ${config.style.sheetBackground};
      border: ${config.style.sheetBorder};
      border-radius: ${config.style.sheetRadius ?? "12px"};
      box-shadow: ${config.style.sheetShadow ?? "none"};
      overflow: hidden;
    }

    .header {
      background: ${config.style.headerBackground};
      color: ${config.style.headerColor};
      padding: 24px 28px;
    }

    .name {
      margin: 0;
      color: ${config.style.headerColor};
      font-size: 30px;
      line-height: 1.1;
      letter-spacing: .02em;
      font-weight: 800;
    }

    .content {
      padding: 22px 28px 26px 28px;
    }

    .section {
      margin-bottom: 18px;
    }

    .section-title {
      margin: 0 0 8px 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: ${config.style.sectionTitleColor};
      font-weight: 700;
    }

    .summary-text {
      margin: 0;
    }

    .experience-item {
      background: ${config.style.itemBackground};
      border: ${config.style.itemBorder};
      border-radius: 8px;
      padding: 9px 10px;
      margin-bottom: 9px;
    }

    .experience-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
    }

    .experience-top h3 {
      margin: 0;
      font-size: 14px;
      color: ${config.style.roleColor ?? "var(--primary-color)"};
    }

    .experience-company {
      margin-top: 2px;
      color: ${config.style.companyColor ?? "var(--primary-color)"};
      font-weight: 500;
    }

    .experience-dates {
      color: ${config.style.dateColor ?? "#6B7280"};
      font-size: 11px;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <main class="sheet">
    <header class="header">
      <h1 class="name">${escapeHtml(meta.title || "Resume")}</h1>
    </header>

    <section class="content">
      ${
        summaryBlocks
          ? `<section class="section">
        <h2 class="section-title">${escapeHtml(config.summaryLabel ?? "Summary")}</h2>
        ${summaryBlocks}
      </section>`
          : ""
      }

      ${
        experienceBlocks
          ? `<section class="section">
        <h2 class="section-title">${escapeHtml(config.experienceLabel ?? "Experience")}</h2>
        ${experienceBlocks}
      </section>`
          : ""
      }
    </section>
  </main>
</body>
</html>`;
  },
});

