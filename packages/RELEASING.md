# Package Versioning Workflow

This repository treats `packages/resume-core` and `packages/resume-templates` as independently versioned packages.

## Rules

1. Any source change under `packages/resume-core/src/**` must bump `packages/resume-core/package.json` `version`.
2. Any source change under `packages/resume-templates/src/**` must bump `packages/resume-templates/package.json` `version`.
3. `dist/**` and lockfile-only changes do not require version bumps.

## CI Enforcement

- GitHub workflow: `.github/workflows/packages-semver-check.yml`
- Script: `.github/scripts/check-packages-semver.mjs`

On pull requests, if package source files change and the corresponding package version does not increase, CI fails.

## Publishing

Publishing is tag-driven via GitHub Actions (`.github/workflows/packages-publish.yml`).

Pre-publish validation on pull requests:

- Workflow: `.github/workflows/packages-publish-dry-run.yml`
- Runs package build + `npm publish --dry-run` for both packages.

Release notes automation:

- Workflow: `.github/workflows/packages-release-notes.yml`
- Generates package-scoped changelog from tag range and creates/updates GitHub release notes.
- Script: `.github/scripts/generate-package-changelog.mjs`

Required secret:

- `NPM_TOKEN` (npm publish token with permission to publish `@hirely/*`)

Tag formats:

- `resume-core-vX.Y.Z` publishes `packages/resume-core`
- `resume-templates-vX.Y.Z` publishes `packages/resume-templates`

Examples:

```bash
git tag resume-core-v1.2.0
git push origin resume-core-v1.2.0

git tag resume-templates-v1.2.0
git push origin resume-templates-v1.2.0
```

## Local Check

Run from `packages/`:

```bash
npm run semver:check
```

You can also run the script directly:

```bash
node .github/scripts/check-packages-semver.mjs
```

Generate changelog text for a tag locally:

```bash
TAG_NAME=resume-core-v1.2.0 npm run changelog:tag
```
