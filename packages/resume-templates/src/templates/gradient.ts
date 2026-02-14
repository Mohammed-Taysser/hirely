import type { TemplateDefinition, TemplateThemeConfig } from "../types";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#111827",
  accentColor: "#7C3AED",
  fontFamily: "'Poppins', 'Inter', sans-serif",
  fontSize: "12px",
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const gradientTemplate: TemplateDefinition = {
  id: "gradient",
  name: "Gradient",
  description: "Modern card layout with a colorful gradient hero header.",
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
          <div class="experience-head">
            <h3>${escapeHtml(s.role)}</h3>
            ${dates ? `<span>${escapeHtml(dates)}</span>` : ""}
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
      background: #F3F4F6;
      padding: 28px;
    }
    .sheet {
      background: white;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 14px 30px rgba(17, 24, 39, 0.12);
    }
    .hero {
      padding: 28px 32px;
      background: linear-gradient(120deg, var(--accent-color), #0EA5E9);
      color: white;
    }
    .hero h1 {
      margin: 0;
      font-size: 30px;
      line-height: 1.1;
      letter-spacing: .02em;
    }
    .content {
      padding: 24px 32px 28px 32px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }
    .section-title {
      margin: 0 0 10px 0;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: #334155;
    }
    .summary-text { margin: 0; }
    .experience-item {
      background: #F8FAFC;
      border-left: 4px solid var(--accent-color);
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 10px;
    }
    .experience-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 10px;
    }
    .experience-head h3 { margin: 0; font-size: 14px; }
    .experience-head span { font-size: 11px; color: #475569; white-space: nowrap; }
    .experience-company { margin-top: 3px; color: #0F172A; font-weight: 500; }
  </style>
</head>
<body>
  <main class="sheet">
    <header class="hero">
      <h1>${escapeHtml(meta.title || "Resume")}</h1>
    </header>
    <section class="content">
      ${
        summaryBlocks
          ? `<div>
        <h2 class="section-title">Summary</h2>
        ${summaryBlocks}
      </div>`
          : ""
      }
      ${
        experienceBlocks
          ? `<div>
        <h2 class="section-title">Experience</h2>
        ${experienceBlocks}
      </div>`
          : ""
      }
    </section>
  </main>
</body>
</html>`;
  },
};

