import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { glob as fgGlob } from 'fast-glob';
import * as fs from 'fs-extra';
import * as pc from 'picocolors';
import { z } from 'zod';

export interface Logger {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
  debug: (msg: string) => void;
}

export const ManifestRecordSchema = z.object({
  component: z.string().min(1),
  category: z.string().optional(),
  file: z.string().optional(),
  props: z.array(z.any()).optional(),
  source: z.string().optional(),
}).passthrough();

export type ManifestRecord = z.infer<typeof ManifestRecordSchema>;

export interface PackageFileRef {
  package: string;
  path: string;
}

export interface AuditContext {
  repoRoot: string;
  manifests: ManifestRecord[];
  uiKitSrcDir: string;
  appsWebSrcDir: string;
  tokensFile: string;
  registryFile: string;
  readmeFiles: PackageFileRef[];
  changelogFiles: PackageFileRef[];
  packageJsons: PackageFileRef[];
  logger: Logger;
}

export function createLogger(verbose = false): Logger {
  return {
    info: (msg) => console.log(pc.cyan('info'), msg),
    warn: (msg) => console.warn(pc.yellow('warn'), msg),
    error: (msg) => console.error(pc.red('error'), msg),
    debug: (msg) => {
      if (verbose) console.log(pc.dim('debug'), pc.dim(msg));
    },
  };
}

interface PackageJsonShape {
  name?: string;
}

async function readJsonSafe<T = unknown>(file: string): Promise<T | null> {
  try {
    return (await fs.readJson(file)) as T;
  } catch {
    return null;
  }
}

async function discoverPackages(repoRoot: string, logger: Logger): Promise<PackageFileRef[]> {
  const pkgJsons = await fgGlob('packages/*/package.json', {
    cwd: repoRoot,
    absolute: true,
    dot: false,
    onlyFiles: true,
  });
  const out: PackageFileRef[] = [];
  for (const file of pkgJsons) {
    const json = await readJsonSafe<PackageJsonShape>(file);
    if (!json?.name) {
      logger.debug(`skipping package without name: ${file}`);
      continue;
    }
    out.push({ package: json.name, path: file });
  }
  return out;
}

async function collectSiblingFiles(
  packageJsons: PackageFileRef[],
  fileName: string,
): Promise<PackageFileRef[]> {
  const out: PackageFileRef[] = [];
  for (const ref of packageJsons) {
    const dir = path.dirname(ref.path);
    const candidate = path.join(dir, fileName);
    if (await fs.pathExists(candidate)) {
      out.push({ package: ref.package, path: candidate });
    }
  }
  return out;
}

interface ManifestModule {
  default?: unknown;
  manifests?: unknown;
  manifest?: unknown;
}

function coerceManifestArray(mod: ManifestModule): unknown[] {
  const candidates = [mod.default, mod.manifests, mod.manifest];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
}

async function loadManifests(repoRoot: string, logger: Logger): Promise<ManifestRecord[]> {
  const manifestFiles = await fgGlob(
    [
      'packages/*/src/manifest.{ts,tsx,js,mjs}',
      'packages/*/src/manifests.{ts,tsx,js,mjs}',
      'packages/*/src/**/manifest.{ts,tsx,js,mjs}',
      'scripts/build-docs/**/manifest.{json,ts}',
      'docs/manifests/*.{json,ts}',
    ],
    {
      cwd: repoRoot,
      absolute: true,
      dot: false,
      onlyFiles: true,
      ignore: ['**/node_modules/**', '**/dist/**'],
    },
  );

  if (manifestFiles.length === 0) {
    logger.debug('no manifest files found — manifests will be empty');
    return [];
  }

  const records: ManifestRecord[] = [];
  for (const file of manifestFiles) {
    try {
      let raw: unknown[] = [];
      if (file.endsWith('.json')) {
        const data = await readJsonSafe<unknown>(file);
        raw = Array.isArray(data) ? data : [];
      } else {
        const mod = (await import(pathToFileURL(file).href)) as ManifestModule;
        raw = coerceManifestArray(mod);
      }
      for (const item of raw) {
        const parsed = ManifestRecordSchema.safeParse(item);
        if (parsed.success) {
          records.push({ ...parsed.data, source: parsed.data.source ?? file });
        } else {
          logger.debug(
            `manifest record skipped in ${file}: ${parsed.error.issues
              .map((i) => i.message)
              .join('; ')}`,
          );
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn(`failed to load manifest ${file}: ${message}`);
    }
  }
  return records;
}

export interface LoadAuditContextOptions {
  logger?: Logger;
}

export async function loadAuditContext(
  repoRoot: string,
  options: LoadAuditContextOptions = {},
): Promise<AuditContext> {
  const logger = options.logger ?? createLogger();
  const absRoot = path.resolve(repoRoot);

  if (!(await fs.pathExists(absRoot))) {
    throw new Error(`repoRoot does not exist: ${absRoot}`);
  }

  const uiKitSrcDir = path.join(absRoot, 'packages/ui-kit/src');
  const appsWebSrcDir = path.join(absRoot, 'apps/web/src');
  const tokensFile = path.join(uiKitSrcDir, 'tokens.ts');
  const registryFile = path.join(uiKitSrcDir, 'registry.ts');

  const packageJsons = await discoverPackages(absRoot, logger);
  const readmeFiles = await collectSiblingFiles(packageJsons, 'README.md');
  const changelogFiles = await collectSiblingFiles(packageJsons, 'CHANGELOG.md');
  const manifests = await loadManifests(absRoot, logger);

  return {
    repoRoot: absRoot,
    manifests,
    uiKitSrcDir,
    appsWebSrcDir,
    tokensFile,
    registryFile,
    readmeFiles,
    changelogFiles,
    packageJsons,
    logger,
  };
}
