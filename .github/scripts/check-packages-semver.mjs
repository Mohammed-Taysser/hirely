import { execSync } from 'node:child_process';
import fs from 'node:fs';

const PACKAGE_PATHS = ['packages/resume-core', 'packages/resume-templates'];

const parseSemver = (version) => {
  const match = String(version).trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
};

const compareSemver = (left, right) => {
  if (left.major !== right.major) return left.major - right.major;
  if (left.minor !== right.minor) return left.minor - right.minor;
  return left.patch - right.patch;
};

const baseSha =
  process.env.BASE_SHA?.trim() ||
  process.env.GITHUB_BASE_SHA?.trim() ||
  execSync('git merge-base origin/main HEAD').toString().trim();
const headSha = process.env.HEAD_SHA?.trim() || process.env.GITHUB_SHA?.trim() || 'HEAD';

const changedFiles = execSync(`git diff --name-only ${baseSha} ${headSha}`)
  .toString()
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

const changedPackages = PACKAGE_PATHS.filter((pkgPath) =>
  changedFiles.some(
    (filePath) =>
      filePath.startsWith(`${pkgPath}/`) &&
      !filePath.startsWith(`${pkgPath}/dist/`) &&
      !filePath.endsWith('/package-lock.json')
  )
);

if (changedPackages.length === 0) {
  console.log('No workspace package source changes detected.');
  process.exit(0);
}

const errors = [];

for (const pkgPath of changedPackages) {
  const packageJsonPath = `${pkgPath}/package.json`;
  const packageJsonChanged = changedFiles.includes(packageJsonPath);

  if (!packageJsonChanged) {
    errors.push(`${pkgPath}: package.json version must be bumped when package source changes.`);
    continue;
  }

  const headPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const headVersion = parseSemver(headPackageJson.version);

  if (!headVersion) {
    errors.push(`${pkgPath}: invalid semver in HEAD (${headPackageJson.version}).`);
    continue;
  }

  let baseRaw = null;
  try {
    baseRaw = execSync(`git show ${baseSha}:${packageJsonPath}`).toString();
  } catch {
    // Package is new in this branch. Skip previous-version validation.
    continue;
  }

  const basePackageJson = JSON.parse(baseRaw);
  const baseVersion = parseSemver(basePackageJson.version);
  if (!baseVersion) {
    errors.push(`${pkgPath}: invalid semver in BASE (${basePackageJson.version}).`);
    continue;
  }

  const diff = compareSemver(headVersion, baseVersion);
  if (diff <= 0) {
    errors.push(
      `${pkgPath}: version must increase (base=${basePackageJson.version}, head=${headPackageJson.version}).`
    );
  }
}

if (errors.length > 0) {
  console.error('Package semver check failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Package semver check passed.');
