import fs from 'node:fs/promises';
import path from 'node:path';

const CHECK_DIRS = [path.resolve('src/modules'), path.resolve('src/jobs'), path.resolve('src/commands')];
const FROM_IMPORT_RE = /\bfrom\s+['"]([^'"]+)['"]/g;
const SIDE_EFFECT_IMPORT_RE = /\bimport\s+['"]([^'"]+)['"]/g;
const LAYER_NAMES = new Set(['domain', 'application', 'infrastructure', 'presentation']);

const isTypeScriptFile = (filePath) =>
  (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) &&
  !filePath.endsWith('.d.ts');

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return isTypeScriptFile(fullPath) ? [fullPath] : [];
    })
  );

  return files.flat();
};

const normalizePath = (filePath) => filePath.split(path.sep).join('/');

const getModuleContextFromPath = (filePath) => {
  const normalized = normalizePath(filePath);
  const match = normalized.match(
    /\/src\/modules\/([^/]+)\/(domain|application|infrastructure|presentation)(?:\/|$)/
  );
  if (!match) {
    return {
      moduleName: null,
      layer: null,
    };
  }

  return {
    moduleName: match[1],
    layer: match[2],
  };
};

const isModuleSourceFile = (filePath) => normalizePath(filePath).includes('/src/modules/');

const parseModulePath = (pathLike) => {
  const normalized = normalizePath(pathLike);
  const match = normalized.match(
    /\/src\/modules\/([^/]+)\/(domain|application|infrastructure|presentation)(?:\/|$)/
  );

  if (!match) {
    return null;
  }

  const [, moduleName, layer] = match;
  if (!LAYER_NAMES.has(layer)) {
    return null;
  }

  return {
    moduleName,
    layer,
    normalized,
  };
};

const resolveImportPath = (filePath, importPath) => {
  if (importPath.startsWith('@/')) {
    return path.resolve('src', importPath.slice(2));
  }

  if (importPath.startsWith('.')) {
    return path.resolve(path.dirname(filePath), importPath);
  }

  return null;
};

const parseAliasModuleImport = (importPath) => {
  const parts = importPath.split('/');
  // @ / modules / <module> / <layer> / ...
  if (parts.length < 4 || parts[1] !== 'modules') {
    return null;
  }

  return {
    moduleName: parts[2],
    layer: parts[3],
  };
};

const readImports = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf8');
  const imports = new Set();

  FROM_IMPORT_RE.lastIndex = 0;
  SIDE_EFFECT_IMPORT_RE.lastIndex = 0;

  let match = FROM_IMPORT_RE.exec(content);
  while (match) {
    imports.add(match[1]);
    match = FROM_IMPORT_RE.exec(content);
  }

  match = SIDE_EFFECT_IMPORT_RE.exec(content);
  while (match) {
    if (!match[0].includes(' from ')) {
      imports.add(match[1]);
    }
    match = SIDE_EFFECT_IMPORT_RE.exec(content);
  }

  return Array.from(imports);
};

const check = async () => {
  const violations = [];
  const files = (await Promise.all(CHECK_DIRS.map((dir) => walk(dir)))).flat();

  for (const file of files) {
    const source = getModuleContextFromPath(file);
    const imports = await readImports(file);

    for (const importPath of imports) {
      const aliasParsed = parseAliasModuleImport(importPath);
      const resolvedImportPath = resolveImportPath(file, importPath);
      const parsed = aliasParsed ?? (resolvedImportPath ? parseModulePath(resolvedImportPath) : null);
      if (!parsed) {
        continue;
      }

      const isShared = parsed.moduleName === 'shared';
      const isSameModule = source.moduleName && parsed.moduleName === source.moduleName;
      if (isShared || isSameModule) {
        if (!isSameModule || !source.layer || !parsed.layer) {
          continue;
        }

        const isForbiddenLayerDependency =
          (source.layer === 'domain' &&
            (parsed.layer === 'application' ||
              parsed.layer === 'infrastructure' ||
              parsed.layer === 'presentation')) ||
          (source.layer === 'application' &&
            (parsed.layer === 'infrastructure' || parsed.layer === 'presentation')) ||
          (source.layer === 'infrastructure' && parsed.layer === 'presentation');

        if (isForbiddenLayerDependency) {
          violations.push({
            file: normalizePath(path.relative(process.cwd(), file)),
            importPath,
            reason: `Layer rule violation inside module "${source.moduleName}": ${source.layer} must not depend on ${parsed.layer}.`,
          });
        }

        continue;
      }

      const isModuleLayerImport =
        parsed.layer === 'domain' || parsed.layer === 'infrastructure' || parsed.layer === 'presentation';

      if (isModuleLayerImport) {
        violations.push({
          file: normalizePath(path.relative(process.cwd(), file)),
          importPath,
          reason:
            'Cross-module imports must target application contracts only (or shared module).',
        });
        continue;
      }

      const isUseCaseImplementationImport =
        isModuleSourceFile(file) &&
        (importPath.includes('/application/use-cases/') ||
          (parsed.normalized && parsed.normalized.includes('/application/use-cases/')));

      if (isUseCaseImplementationImport) {
        violations.push({
          file: normalizePath(path.relative(process.cwd(), file)),
          importPath,
          reason:
            'Modules must not depend on application use-case implementations; depend on application contracts/services instead.',
        });
      }
    }
  }

  if (violations.length === 0) {
    console.log('Boundary check passed: no architecture boundary violations found.');
    return;
  }

  console.error(`Boundary check failed with ${violations.length} violation(s):`);
  for (const violation of violations) {
    console.error(`- ${violation.file}`);
    console.error(`  import: ${violation.importPath}`);
    console.error(`  reason: ${violation.reason}`);
  }

  process.exitCode = 1;
};

await check();
