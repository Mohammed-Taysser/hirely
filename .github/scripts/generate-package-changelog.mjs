import { execSync } from 'node:child_process';

const tagName = process.env.TAG_NAME?.trim() || process.env.GITHUB_REF_NAME?.trim() || '';

if (!tagName) {
  console.error('TAG_NAME or GITHUB_REF_NAME is required.');
  process.exit(1);
}

const packageMap = {
  'resume-core-v': {
    packageName: '@hirely/resume-core',
    packagePath: 'packages/resume-core',
  },
  'resume-templates-v': {
    packageName: '@hirely/resume-templates',
    packagePath: 'packages/resume-templates',
  },
};

const matchedPrefix = Object.keys(packageMap).find((prefix) => tagName.startsWith(prefix));
if (!matchedPrefix) {
  console.error(`Unsupported tag format: ${tagName}`);
  process.exit(1);
}

const { packageName, packagePath } = packageMap[matchedPrefix];

const allTags = execSync(`git tag --list '${matchedPrefix}*' --sort=-version:refname`)
  .toString()
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

const previousTag = allTags.find((tag) => tag !== tagName) || null;
const commitRange = previousTag ? `${previousTag}..${tagName}` : tagName;

const commitLines = execSync(
  `git log ${commitRange} --pretty=format:'- %s (%h)' -- ${packagePath}`
)
  .toString()
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

const changelogLines = [
  `## ${packageName} (${tagName})`,
  '',
  previousTag
    ? `Changes since ${previousTag}:`
    : 'Initial package release notes for this tag range:',
  '',
  ...(commitLines.length > 0 ? commitLines : ['- No package-path commits detected in this range.']),
  '',
];

process.stdout.write(changelogLines.join('\n'));
