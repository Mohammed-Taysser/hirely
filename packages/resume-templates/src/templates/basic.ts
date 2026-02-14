import type { TemplateDefinition, TemplateThemeConfig } from "../types";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#111827",
  accentColor: "#2563EB",
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  fontSize: "12px",
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const basicTemplate: TemplateDefinition = {
  id: "basic",
  name: "Basic",
  description: "Straightforward resume layout with clean spacing.",
  version: "1.0.0",
  defaultThemeConfig: defaultTheme,
  renderHtml(viewModel, theme = defaultTheme) {
    const { meta, sections } = viewModel;

    const summaryBlocks = sections
      .filter((s) => s.type === "summary")
      .map((s) => `<p class="summary-text">${escapeHtml(s.text)}</p>`)
      .join("\n");

    const experienceBlocks = sections
      .filter((s) => s.type === "experience")
      .map((s) => {
        const dates = [s.startDateLabel, s.endDateLabel].filter(Boolean).join(" - ");
        return `
        <article class="experience-item">
          <div class="experience-header">
            <h3>${escapeHtml(s.role)}</h3>
            ${dates ? `<span class="experience-dates">${escapeHtml(dates)}</span>` : ""}
          </div>
          <div class="experience-company">${escapeHtml(s.company)}</div>
        </article>`;
      })
      .join("\n");

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
      line-height: 1.5;
      padding: 36px 40px;
    }

    .header {
      margin-bottom: 18px;
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 10px;
    }
    .name {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      color: var(--primary-color);
    }
    .section { margin-bottom: 18px; }
    .section-title {
      margin: 0 0 8px 0;
      color: var(--accent-color);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .06em;
      font-size: 12px;
    }
    .summary-text { margin: 0; }
    .experience-item { margin-bottom: 12px; }
    .experience-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: baseline;
    }
    .experience-header h3 { margin: 0; font-size: 14px; }
    .experience-company { color: #374151; margin-top: 2px; }
    .experience-dates { color: #6B7280; font-size: 11px; white-space: nowrap; }
  </style>
</head>
<body>
  <header class="header">
    <h1 class="name">${escapeHtml(meta.title || "Resume")}</h1>
  </header>

  ${
    summaryBlocks
      ? `<section class="section">
    <h2 class="section-title">Summary</h2>
    ${summaryBlocks}
  </section>`
      : ""
  }

  ${
    experienceBlocks
      ? `<section class="section">
    <h2 class="section-title">Experience</h2>
    ${experienceBlocks}
  </section>`
      : ""
  }
</body>
</html>`;
  },
};

