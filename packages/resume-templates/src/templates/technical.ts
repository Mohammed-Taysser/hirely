import type { TemplateDefinition, TemplateThemeConfig } from "../types";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#0F172A",
  accentColor: "#0EA5E9",
  fontFamily: "'IBM Plex Mono', 'Menlo', monospace",
  fontSize: "11px",
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const technicalTemplate: TemplateDefinition = {
  id: "technical",
  name: "Technical",
  description: "Structured engineering style with terminal-like visual language.",
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
        const dates = [s.startDateLabel, s.endDateLabel].filter(Boolean).join(" -> ");
        return `
        <article class="experience-item">
          <div class="line"><span class="token">role</span>${escapeHtml(s.role)}</div>
          <div class="line"><span class="token">company</span>${escapeHtml(s.company)}</div>
          ${dates ? `<div class="line"><span class="token">period</span>${escapeHtml(dates)}</div>` : ""}
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
      color: #E2E8F0;
      background: #020617;
      padding: 24px;
    }
    .terminal {
      border: 1px solid #1E293B;
      border-radius: 8px;
      overflow: hidden;
      background: #0F172A;
    }
    .terminal-head {
      padding: 8px 12px;
      background: #111827;
      color: #94A3B8;
      border-bottom: 1px solid #1E293B;
      font-size: 10px;
      letter-spacing: .06em;
      text-transform: uppercase;
    }
    .terminal-body { padding: 14px 16px; }
    h1 {
      margin: 0 0 14px 0;
      color: var(--accent-color);
      font-size: 20px;
      letter-spacing: .03em;
    }
    .section { margin-bottom: 14px; }
    .section-title {
      margin: 0 0 8px 0;
      color: #7DD3FC;
      text-transform: uppercase;
      letter-spacing: .08em;
      font-size: 11px;
      font-weight: 700;
    }
    .summary-text { margin: 0; color: #CBD5E1; }
    .experience-item {
      border: 1px solid #1E293B;
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 8px;
      background: #0B1220;
    }
    .line { margin-bottom: 2px; color: #E2E8F0; }
    .line:last-child { margin-bottom: 0; }
    .token {
      display: inline-block;
      width: 74px;
      color: #38BDF8;
      text-transform: uppercase;
      font-size: 10px;
      margin-right: 10px;
    }
  </style>
</head>
<body>
  <main class="terminal">
    <header class="terminal-head">hirely.resume</header>
    <section class="terminal-body">
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
    </section>
  </main>
</body>
</html>`;
  },
};

