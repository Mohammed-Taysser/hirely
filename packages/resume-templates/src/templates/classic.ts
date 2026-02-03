import type { TemplateDefinition, TemplateThemeConfig } from "../types";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#111827", // gray-900
  accentColor: "#2563EB", // blue-600
  fontFamily:
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: "12px",
};

export const classicTemplate: TemplateDefinition = {
  id: "classic",
  name: "Classic",
  description: "Clean single-column layout with emphasis on experience.",
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
        const titleLine = `${escapeHtml(s.role)} @ ${escapeHtml(s.company)}`;
        const dates: string[] = [];
        if (s.startDateLabel) dates.push(escapeHtml(s.startDateLabel));
        if (s.endDateLabel) dates.push(escapeHtml(s.endDateLabel));
        const datesText = dates.join(" — ");

        return `
        <div class="experience-item">
          <div class="experience-header">
            <div class="experience-title">${titleLine}</div>
            ${datesText ? `<div class="experience-dates">${datesText}</div>` : ""}
          </div>
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
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      padding: 32px 40px;
      line-height: 1.5;
    }

    @page {
      margin: 32px 40px;
    }

    h1 {
      font-size: 24px;
      margin: 0 0 4px 0;
    }

    .header {
      border-bottom: 2px solid var(--accent-color);
      padding-bottom: 8px;
      margin-bottom: 16px;
    }

    .section {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent-color);
      margin-bottom: 6px;
      font-weight: 600;
    }

    .summary-text {
      margin: 0;
    }

    .experience-item {
      margin-bottom: 8px;
    }

    .experience-header {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    .experience-title {
      font-weight: 600;
    }

    .experience-dates {
      font-size: 11px;
      color: #6b7280;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>${escapeHtml(meta.title || "Resume")}</h1>
  </header>

  ${
    summaryBlocks
      ? `<section class="section">
    <div class="section-title">Summary</div>
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
