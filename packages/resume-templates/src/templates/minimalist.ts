import type { TemplateDefinition, TemplateThemeConfig } from "../types";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#374151",
  accentColor: "#10B981",
  fontFamily: "'Georgia', serif",
  fontSize: "11px",
};

export const minimalistTemplate: TemplateDefinition = {
  id: "minimalist",
  name: "Minimalist",
  description: "Elegant serif-based layout for a refined professional look.",
  version: "1.0.0",
  defaultThemeConfig: defaultTheme,
  renderHtml(viewModel, theme = defaultTheme) {
    const { meta, sections } = viewModel;

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const summaryBlocks = sections
      .filter((s) => s.type === "summary")
      .map((s) => `<p class="summary-text">${escapeHtml(s.text)}</p>`)
      .join("\n");

    const experienceBlocks = sections
      .filter((s) => s.type === "experience")
      .map((s) => {
        const dates: string[] = [];
        if (s.startDateLabel) dates.push(escapeHtml(s.startDateLabel));
        if (s.endDateLabel) dates.push(escapeHtml(s.endDateLabel));
        const datesText = dates.join(" - ");

        return `
        <div class="experience-item">
          <div class="experience-meta">
            <span class="experience-company">${escapeHtml(s.company)}</span>
            ${datesText ? `<span class="experience-dates">${datesText}</span>` : ""}
          </div>
          <div class="experience-role">${escapeHtml(s.role)}</div>
        </div>`;
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

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      font-family: var(--font-family);
      font-size: var(--font-size);
      color: var(--primary-color);
    }

    body {
      padding: 48px;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      font-size: 28px;
      font-weight: normal;
      margin: 0 0 24px 0;
      text-align: center;
      letter-spacing: 0.05em;
    }

    .section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 14px;
      font-style: italic;
      color: var(--accent-color);
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 12px;
      padding-bottom: 4px;
    }

    .summary-text {
      margin: 0;
      text-align: justify;
    }

    .experience-item {
      margin-bottom: 16px;
    }

    .experience-meta {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
    }

    .experience-role {
      font-style: italic;
      color: #4b5563;
    }

    .experience-dates {
      font-weight: normal;
      font-size: 10px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(meta.title || "Resume")}</h1>

  ${
    summaryBlocks
      ? `<section class="section">
    <div class="section-title">Profile</div>
    ${summaryBlocks}
  </section>`
      : ""
  }

  ${
    experienceBlocks
      ? `<section class="section">
    <div class="section-title">Experience</div>
    ${experienceBlocks}
  </section>`
      : ""
  }
</body>
</html>`;
  },
};
