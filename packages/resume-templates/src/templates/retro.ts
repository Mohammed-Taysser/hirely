import type { TemplateDefinition, TemplateThemeConfig } from "../types";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#3F2E1E",
  accentColor: "#B45309",
  fontFamily: "'Courier Prime', 'Courier New', monospace",
  fontSize: "12px",
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const retroTemplate: TemplateDefinition = {
  id: "retro",
  name: "Retro",
  description: "Typewriter-inspired layout with warm vintage tones.",
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
        const dates = [s.startDateLabel, s.endDateLabel].filter(Boolean).join(" / ");
        return `
        <article class="experience-item">
          <div class="label">ROLE</div>
          <h3>${escapeHtml(s.role)}</h3>
          <div class="company">@ ${escapeHtml(s.company)}</div>
          ${dates ? `<div class="dates">${escapeHtml(dates)}</div>` : ""}
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
      background: #FFFBEB;
      padding: 28px;
    }
    .sheet {
      border: 2px solid #D97706;
      padding: 20px 24px;
      background: #FEF3C7;
      box-shadow: 8px 8px 0 rgba(180, 83, 9, 0.25);
    }
    h1 {
      margin: 0 0 14px 0;
      font-size: 24px;
      letter-spacing: .06em;
      text-transform: uppercase;
      color: var(--accent-color);
    }
    .section {
      margin-top: 14px;
      border-top: 1px dashed #92400E;
      padding-top: 10px;
    }
    .section-title {
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: .1em;
      font-size: 12px;
      color: #92400E;
      font-weight: 700;
    }
    .summary-text { margin: 0; }
    .experience-item {
      border: 1px dashed #B45309;
      padding: 8px;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.3);
    }
    .label { font-size: 10px; color: #92400E; letter-spacing: .08em; }
    .experience-item h3 { margin: 2px 0 0 0; font-size: 14px; }
    .company { margin-top: 2px; }
    .dates { margin-top: 2px; font-size: 11px; color: #78350F; }
  </style>
</head>
<body>
  <main class="sheet">
    <h1>${escapeHtml(meta.title || "Resume")}</h1>

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
  </main>
</body>
</html>`;
  },
};

