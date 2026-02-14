import type { TemplateDefinition, TemplateThemeConfig } from "../types";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#1F2937",
  accentColor: "#0F766E",
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: "13px",
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const elegantTemplate: TemplateDefinition = {
  id: "elegant",
  name: "Elegant",
  description: "Refined serif resume style with subtle separators.",
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
        const dates = [s.startDateLabel, s.endDateLabel].filter(Boolean).join(" — ");
        return `
        <article class="experience-item">
          <div class="experience-top">
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
      color: var(--primary-color);
      font-size: var(--font-size);
      line-height: 1.45;
      padding: 42px 52px;
      background: #FFFEFA;
    }
    .frame {
      border: 1px solid #D1D5DB;
      padding: 26px 30px;
    }
    .name {
      margin: 0;
      font-size: 32px;
      letter-spacing: .04em;
      font-weight: 600;
      text-align: center;
      color: var(--accent-color);
    }
    .name-rule {
      margin: 10px auto 24px auto;
      width: 180px;
      border-top: 1px solid #99F6E4;
    }
    .section { margin-bottom: 18px; }
    .section-title {
      margin: 0 0 8px 0;
      font-size: 12px;
      letter-spacing: .16em;
      text-transform: uppercase;
      color: #0F766E;
      font-weight: 700;
    }
    .summary-text { margin: 0; font-size: 15px; }
    .experience-item {
      padding: 9px 0;
      border-top: 1px dashed #D1D5DB;
    }
    .experience-item:last-child { border-bottom: 1px dashed #D1D5DB; }
    .experience-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
    }
    .experience-top h3 { margin: 0; font-size: 17px; font-weight: 600; }
    .experience-top span { font-size: 12px; color: #6B7280; white-space: nowrap; }
    .experience-company { font-style: italic; color: #374151; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="frame">
    <h1 class="name">${escapeHtml(meta.title || "Resume")}</h1>
    <div class="name-rule"></div>

    ${
      summaryBlocks
        ? `<section class="section">
      <h2 class="section-title">Profile</h2>
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
  </div>
</body>
</html>`;
  },
};

