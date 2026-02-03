import type { TemplateDefinition, TemplateThemeConfig } from "../types";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#1F2937",
  accentColor: "#4F46E5",
  fontFamily: "'Inter', sans-serif",
  fontSize: "12px",
};

export const modernTemplate: TemplateDefinition = {
  id: "modern",
  name: "Modern",
  description: "Bold two-tone design with a dynamic sidebar feel.",
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
      .map((s) => `<p>${escapeHtml(s.text)}</p>`)
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
          <div class="experience-header">
            <h3>${escapeHtml(s.role)}</h3>
            <span class="dates">${datesText}</span>
          </div>
          <div class="company">${escapeHtml(s.company)}</div>
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

    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; font-family: var(--font-family); font-size: var(--font-size); color: var(--primary-color); }

    .container {
      display: grid;
      grid-template-columns: 240px 1fr;
      min-height: 100vh;
    }

    .sidebar {
      background: var(--primary-color);
      color: white;
      padding: 40px 24px;
    }

    .main {
      padding: 40px;
      background: white;
    }

    .name {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 8px;
      line-height: 1.2;
    }

    .sidebar-section {
      margin-bottom: 24px;
    }

    .sidebar-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.6;
      margin-bottom: 8px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--accent-color);
      border-bottom: 2px solid var(--accent-color);
      margin-bottom: 16px;
      padding-bottom: 4px;
      text-transform: uppercase;
    }

    .experience-item {
      margin-bottom: 20px;
    }

    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .experience-header h3 {
      margin: 0;
      font-size: 14px;
    }

    .dates {
      font-size: 10px;
      color: #6B7280;
    }

    .company {
      font-weight: 600;
      color: var(--accent-color);
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div class="name">${escapeHtml(meta.title || "Resume")}</div>
      <div class="sidebar-section">
        <div class="sidebar-title">Contact</div>
        <div style="font-size: 11px; opacity: 0.9;">Details hidden for privacy</div>
      </div>
    </div>
    <div class="main">
      ${
        summaryBlocks
          ? `<section>
        <div class="section-title">Professional Summary</div>
        ${summaryBlocks}
      </section>`
          : ""
      }

      ${
        experienceBlocks
          ? `<section style="margin-top: 32px;">
        <div class="section-title">Work Experience</div>
        ${experienceBlocks}
      </section>`
          : ""
      }
    </div>
  </div>
</body>
</html>`;
  },
};
