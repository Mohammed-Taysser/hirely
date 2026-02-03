---
name: Resume template system & shared package plan
overview: ""
todos:
  - id: template-core-design
    content: Design the core template interface, view-model shape, and template registry in the shared templates package.
    status: completed
  - id: classic-template-implementation
    content: Implement the initial React-based resume template (`ClassicTemplate`) and register it with id, name, and version.
    status: completed
    dependencies:
      - template-core-design
  - id: template-registry-api
    content: Add helper APIs and backend endpoints to list available templates and fetch metadata for the frontend template picker.
    status: completed
    dependencies:
      - template-core-design
  - id: publish-resume-templates-package
    content: Configure build and publish workflow for the `@yourorg/resume-templates` package for both monorepo use and npm distribution.
    status: completed
    dependencies:
      - template-core-design
      - classic-template-implementation
  - id: db-template-metadata
    content: Update database models and persistence to store per-resume `templateId`, optional `templateVersion`, and theme configuration settings.
    status: completed
    dependencies:
      - template-core-design
  - id: export-pipeline-integration
    content: Wire the shared templates into the backend export pipeline so exports use the same React components as frontend preview via SSR and HTML→PDF.
    status: completed
    dependencies:
      - classic-template-implementation
      - publish-resume-templates-package
---

## Resume template system & shared package plan

### Overview

Design a **template system** that: (1) renders resumes from a shared view‑model, (2) lets you add/update templates safely, (3) exposes templates to the app via a **shared package** (used by FE + BE), and (4) uses a **database only for configuration/selection**, not for storing template code.

---

### 1. Core decisions & technologies

- **Language for templates & logic**
- Use **TypeScript** as the main language for:
- `buildResumeViewModel` (data normalization), and
- template definitions.
- **HTML rendering approach**
- Use **React components** to generate HTML from the view‑model:
- Frontend: render React components directly for live preview.
- Backend: render the same components to HTML string via React SSR, then to PDF via a headless browser.
- **Shared location**
- Place all of this in a shared package, e.g. `@yourorg/resume-templates`, inside a monorepo `packages/resume-templates`.
- Optionally publish it to npm so external services can consume the same templates.

---

### 2. Template model & interface

- **Define a template interface** in the shared package, e.g.:
- `id`: string (e.g. `classic`, `modern`, `compact`)
- `name`: human‑readable name
- `description`: short marketing text
- `version`: semantic version like `1.0.0`
- `component`: React component `(props: { viewModel, themeConfig }) => JSX.Element`
- `defaultThemeConfig`: colors, fonts, spacing

- **Create a registry of templates** in the shared package:
- Export a `templates` map/array describing all available templates.
- Also export helper functions:
- `getTemplateById(id)`
- `listTemplates()`
- This registry is the **single source of truth** for which templates exist in code.

- **Separate data from styling**
- Templates must only read from the **view‑model** and `themeConfig`, not from raw DB or global state.
- This enforces consistency across FE/BE and makes templates easy to reason about.

---

### 3. Creating templates step by step

1. **Design the view‑model** (already covered conceptually)

- `buildResumeViewModel(rawJson)` returns a consistent structure (sections, items, formatted dates).
- This lives in a separate shared package (`@yourorg/resume-core`) or the same package if small.

2. **Create a base `ResumeLayout` component**

- A generic React component that:
- Receives `viewModel` and `themeConfig`.
- Provides common layout: page margins, fonts, typography, print CSS helpers.
- Accepts children for specific section arrangements.

3. **Define a first template** (e.g. `ClassicTemplate`)

- Implement `ClassicTemplate` as a functional React component:
- Uses `ResumeLayout` for the base.
- Arranges sections (header, experience, education, skills) in a specific layout.
- Applies styles through CSS modules, CSS‑in‑JS, or Tailwind classes.
- Export it and add to the `templates` registry.

4. **Add additional templates** (`ModernTemplate`, `CompactTemplate`, etc.)

- Follow the same pattern: pure components consuming `viewModel` + `themeConfig`.
- Reuse shared section subcomponents where possible (e.g. `ExperienceSection`, `SkillsSection`).

5. **Ensure print‑friendly CSS**

- Use a print stylesheet that:
- Fixes page size (A4/Letter), margins.
- Avoids page breaks inside important sections.
- Keep this CSS inside the shared template package so FE and BE share the same look.

---

### 4. Updating a specific template safely

- **Versioning in code**
- Each template has a `version` field in the shared package.
- When you change layout or styling in a breaking way:
- Bump the version (e.g. `1.1.0` or `2.0.0`).

- **Handling existing users**
- Store, in your DB per resume:
- `templateId` (e.g. `classic`)
- optional `templateVersion` (e.g. `1.0.0`) if you want to lock to a specific version.
- Strategies:
- **Loose coupling**: resume only stores `templateId` and always uses the latest version.
- **Strict locking**: resume stores `templateId` + `templateVersion`; when you introduce a breaking change, you may:
- support multiple versions side‑by‑side in the code, or
- run a migration to update `templateVersion` and adjust saved settings.

- **Change process**
- Update the React component for the template.
- Adjust version number in the registry.
- Run visual regression tests with sample JSON.
- Deploy new version of the shared package and bump it in FE/BE.

---

### 5. Publishing as a separate package

- **Package structure**
- `packages/resume-templates/package.json` with:
- `name`: `@yourorg/resume-templates`
- `main`/`module`/`types` fields configured for Node + bundlers.
- TypeScript configuration to emit JavaScript + type declarations.

- **Build step**
- Add a build script (e.g. `tsc` or bundler) that outputs compiled code to `dist/`.
- Ensure CSS or styling is handled in a way consumers can import (e.g. CSS modules, or exposing classNames and letting consumers bundle CSS).

- **Publish flow (combined with monorepo use)**
- Inside monorepo:
- `apps/web` and `apps/api` depend on `@yourorg/resume-templates` via workspace/links.
- For external use:
- Run `npm publish` (or via CI) from `packages/resume-templates`.
- External projects install it: `npm install @yourorg/resume-templates`.
- Use semantic versioning and tags to control rollout.

---

### 6. What to store in the database (and what not)

- **Store in DB**:
- Per user/resume:
- `templateId`
- optional `templateVersion`
- `themeConfig` overrides (colors, font size, etc.)
- Optional catalog/metadata table:
- `templateId`, `name`, `description`, `isPremium`, maybe `previewImageUrl`.

- **Do NOT store in DB**:
- Template code (JS/TS/HTML/CSS) itself.
- Layout logic.

- **Why not store code in DB?**
- Harder to version, test, and deploy.
- Security risk (dynamic code from DB).
- Harder to share across multiple services.

- **How selection works**
- Frontend loads available templates (from a simple API or a static list coming from the shared package’s registry).
- User selects a template; FE saves `templateId` (and maybe `themeConfig`) in backend.
- On preview/export, BE reads `templateId` from DB and uses the shared package to pick the right component.

---

### 7. Language & HTML rendering details

- **Language**: TypeScript for all logic and React for templates.
- Benefits:
- Strong typing of view‑model.
- Great ecosystem for FE and SSR.
- Easy to run in Node (BE) and browser (FE).

- **HTML generation**:
- **Frontend**:
- React renders templates directly into DOM for live preview.
- **Backend**:
- Use React DOM Server (or framework SSR) to render template to HTML string.
- Feed that HTML to a headless browser (Puppeteer/Playwright) to export high‑fidelity PDFs.

- **Alternative** (if not React):
- Use a string‑based templating engine (e.g. Handlebars, EJS, Nunjucks) in the shared package.
- Render HTML strings directly in FE and BE.
- React is generally better if your frontends are JS‑framework based; string templates are simpler but less powerful.

---

### 8. Frequently asked questions & patterns

- **Q: How do I add a new template without breaking old ones?**
- Implement a new React component, give it a new `id` and `version` in the registry, deploy the new package, and expose it in the template picker UI.

- **Q: How do I deprecate a template?**
- Mark it as `deprecated` in the registry (and maybe in DB metadata); hide it from new users but still support it for resumes that already use it.

- **Q: How do I experiment with template changes?**
- Create a new version or a new `id` (e.g. `classic-v2`), behind a feature flag; run A/B tests by selecting between IDs.

- **Q: Can mobile apps use the same templates?**
- If they use React Native with web rendering or a webview, they can reuse the HTML/React approach.
- Otherwise, they can call your backend export API to get PDF/HTML and display that instead of re‑implementing templates natively.

- **Q: What if I want non‑HTML exports (DOCX, etc.)?**
- Either convert HTML→DOCX using a tool, or create a second set of templates in the same shared package that render DOCX structures from the same view‑model.

---

### Implementation todos

- **template-core-design**: Define the template interface (`TemplateDefinition`), the view‑model shape, and the template registry structure.
- **classic-template-implementation**: Implement the first React template (`ClassicTemplate`) and wire it into the registry with versioning.
- **template-registry-api**: Expose helper functions to list/get templates and build REST/GraphQL endpoints so the frontend can fetch available templates.
- **publish-resume-templates-package**: Configure build + publish flow for `@yourorg/resume-templates` as a shared package (used locally in monorepo and published to npm).
- **db-template-metadata**: Adjust DB models to store `templateId`, optional `templateVersion`, and user `themeConfig` while keeping template code in the shared package.
- **export-pipeline-integration**: Integrate the templates package into the backend export pipeline (SSR → HTML → PDF) and ensure the frontend preview uses the same components.