/**
 * Gate 01 — coverage-components
 *
 * For each export in `packages/ui-kit/src/index.tsx` that maps to a component
 * registered in `registry.ts` (UI_KIT_COMPONENTS), verify the existence of:
 *
 *   1. <home>/<Component>.manifest.ts   — blocker if missing
 *   2. <home>/<Component>.examples.tsx  — major if missing
 *   3. A test file for the component    — major if missing
 *
 * Where <home> is resolved as follows:
 *   - If `packages/ui-kit/src/<re-export>/<Component>.tsx` exists, use that
 *     directory (per-component file pattern).
 *   - Else if `packages/ui-kit/src/<re-export>.tsx` exists, the component is
 *     part of a grouped barrel; the manifest/examples are expected next to a
 *     per-component split that Ola 4c.2 will introduce, so they live in the
 *     same dir as the grouped file.
 *
 * Test file resolution accepts any of:
 *   - `<home>/<Component>.test.tsx`                         (co-located)
 *   - `<uiKitSrcDir>/__tests__/<rel>/<Component>.test.tsx`  (mirrored)
 *   - `<uiKitSrcDir>/__tests__/<group>.test.tsx`            (grouped — for
 *     components exported from a grouped barrel like `inputs.tsx`)
 *
 * Programmatic API:
 *   const gate = new CoverageComponentsGate();
 *   const result = await gate.run(ctx);
 *
 * CLI: meta — invoked by the audit runner. No standalone CLI.
 *
 * Safety: read-only. Walks the FS and parses two TS files via regex. Never
 * imports executable code.
 */

import * as path from 'node:path';
import * as fs from 'fs-extra';

import { Gate, gateFail, gateOk, type AuditContext, type GateFinding, type GateResult } from '../_lib/gate-base.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IndexExportEntry {
  /** the relative module path written in the export statement, e.g. './cards/PixelFeatureCard' */
  relPath: string;
  /** absolute path to a candidate source file (.tsx) or grouped barrel file */
  resolvedFile: string | null;
  /** absolute path to the directory the export resolves into */
  resolvedDir: string | null;
  /** true when the export resolves to a file like `<dir>/<X>.tsx` (per-component) */
  isPerComponent: boolean;
  /** true when the export resolves to a directory (barrel via index.ts) */
  isBarrelDir: boolean;
}

interface ResolvedHome {
  /** absolute directory that the component should live in */
  dir: string;
  /** absolute path to the component source file if one exists */
  sourceFile: string | null;
  /** the re-export base used to resolve this home (relative to uiKitSrcDir, posix-style) */
  rel: string;
  /** true when the home was inferred from a grouped barrel file */
  fromGroup: boolean;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

const COMPONENT_PREFIXES = ['Pixel', 'PxlKit'];

function looksLikeComponentName(s: string): boolean {
  return COMPONENT_PREFIXES.some((p) => s.startsWith(p));
}

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

/**
 * Parse the registry.ts file for the `UI_KIT_COMPONENTS` tuple. Regex-based
 * to avoid importing TS source. Returns a Set of component identifiers.
 */
export async function readRegistry(registryFile: string): Promise<Set<string>> {
  const raw = await fs.readFile(registryFile, 'utf8');
  const start = raw.indexOf('UI_KIT_COMPONENTS');
  if (start < 0) return new Set();
  const lbracket = raw.indexOf('[', start);
  const rbracket = raw.indexOf(']', lbracket);
  if (lbracket < 0 || rbracket < 0) return new Set();
  const inside = raw.slice(lbracket + 1, rbracket);
  const matches = inside.match(/['"]([A-Za-z][A-Za-z0-9_]*)['"]/g) ?? [];
  const out = new Set<string>();
  for (const m of matches) {
    const name = m.slice(1, -1);
    if (looksLikeComponentName(name)) out.add(name);
  }
  return out;
}

/**
 * Parse `packages/ui-kit/src/index.tsx` and extract the relative module path
 * for every `export * from './...'` statement and named-export module path.
 */
export function parseIndexExports(indexSource: string): string[] {
  const out = new Set<string>();
  // export * from './foo'
  const rxStar = /export\s+\*\s+(?:as\s+\w+\s+)?from\s+['"]([^'"\n]+)['"]/g;
  // export { X, type Y } from './foo'
  const rxNamed = /export\s*\{[^}]*\}\s*from\s+['"]([^'"\n]+)['"]/g;
  // export type * / export type { ... } from './foo'
  const rxType = /export\s+type\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"\n]+)['"]/g;

  for (const rx of [rxStar, rxNamed, rxType]) {
    let m: RegExpExecArray | null;
    while ((m = rx.exec(indexSource)) !== null) {
      const rel = m[1];
      if (rel && rel.startsWith('.')) out.add(rel);
    }
  }
  return Array.from(out);
}

const SOURCE_EXTS = ['.tsx', '.ts'];

async function resolveExport(uiKitSrcDir: string, rel: string): Promise<IndexExportEntry> {
  const base = path.resolve(uiKitSrcDir, rel);
  for (const ext of SOURCE_EXTS) {
    const candidate = base + ext;
    if (await fs.pathExists(candidate)) {
      return {
        relPath: rel,
        resolvedFile: candidate,
        resolvedDir: path.dirname(candidate),
        isPerComponent: true,
        isBarrelDir: false,
      };
    }
  }
  if (await fs.pathExists(base)) {
    const stat = await fs.stat(base);
    if (stat.isDirectory()) {
      return {
        relPath: rel,
        resolvedFile: null,
        resolvedDir: base,
        isPerComponent: false,
        isBarrelDir: true,
      };
    }
  }
  return {
    relPath: rel,
    resolvedFile: null,
    resolvedDir: null,
    isPerComponent: false,
    isBarrelDir: false,
  };
}

/**
 * Read the named exports of a single file. Detects:
 *   - `export const Foo`, `export function Foo`, `export class Foo`
 *   - `export { Foo, Bar as Baz }`
 *   - `export const { Foo, Bar }`  (rare; we still capture identifiers)
 *   - `export * from './X'` — recursively follows the re-export to the target
 *     file (or directory + index.{ts,tsx}) and merges its named exports.
 *
 * The `seen` set guards against cycles in `export *` graphs.
 */
async function readNamedExports(
  file: string,
  seen: Set<string> = new Set(),
): Promise<Set<string>> {
  const map = await readNamedExportsWithOrigin(file, seen);
  return new Set(map.keys());
}

/**
 * Variant of `readNamedExports` that returns a map of `name → originFile`
 * (the file where the symbol was DECLARED, after walking through any chain
 * of `export * from './X'` re-exports). When the same name is discovered
 * via multiple paths we keep the first one encountered.
 */
async function readNamedExportsWithOrigin(
  file: string,
  seen: Set<string> = new Set(),
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const absFile = path.resolve(file);
  if (seen.has(absFile)) return out;
  seen.add(absFile);

  let raw: string;
  try {
    raw = await fs.readFile(absFile, 'utf8');
  } catch {
    return out;
  }
  const rxConst = /export\s+(?:const|let|var|function|class|enum|interface|type)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  let m: RegExpExecArray | null;
  while ((m = rxConst.exec(raw)) !== null) {
    if (!out.has(m[1])) out.set(m[1], absFile);
  }
  const rxBlock = /export\s*\{([^}]+)\}/g;
  while ((m = rxBlock.exec(raw)) !== null) {
    const body = m[1];
    for (const part of body.split(',')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      // handle `type Foo`, `Foo as Bar`
      const noType = trimmed.replace(/^type\s+/, '');
      const asMatch = /\bas\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*$/.exec(noType);
      const id = asMatch ? asMatch[1] : noType.replace(/\s.*$/, '');
      if (id && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(id)) {
        if (!out.has(id)) out.set(id, absFile);
      }
    }
  }
  // Second pass — `export * from './X'`. Recurse into the target and merge.
  const rxStar = /export\s+\*\s+(?:as\s+\w+\s+)?from\s+['"]([^'"\n]+)['"]/g;
  const baseDir = path.dirname(absFile);
  while ((m = rxStar.exec(raw)) !== null) {
    const rel = m[1];
    if (!rel || !rel.startsWith('.')) continue;
    const target = path.resolve(baseDir, rel);
    // Resolve target: <target>.tsx, <target>.ts, <target>/index.{ts,tsx}
    let resolved: string | null = null;
    for (const ext of SOURCE_EXTS) {
      const candidate = target + ext;
      if (await fs.pathExists(candidate)) {
        resolved = candidate;
        break;
      }
    }
    if (!resolved && (await fs.pathExists(target))) {
      try {
        const stat = await fs.stat(target);
        if (stat.isDirectory()) {
          for (const ext of SOURCE_EXTS) {
            const idx = path.join(target, `index${ext}`);
            if (await fs.pathExists(idx)) {
              resolved = idx;
              break;
            }
          }
        }
      } catch {
        // ignore
      }
    }
    if (!resolved) continue;
    const nested = await readNamedExportsWithOrigin(resolved, seen);
    for (const [name, origin] of nested) {
      if (!out.has(name)) out.set(name, origin);
    }
  }
  return out;
}

/**
 * Build the mapping component → resolved home directory. Walks each export
 * entry from `index.tsx`. For per-component exports (e.g. `./cards/PixelFeatureCard`)
 * the home is the dir of the source file. For grouped barrels (e.g. `./inputs`
 * which is `inputs.tsx`) the home is the same dir, and the resolution is flagged
 * as `fromGroup`.
 */
export async function resolveComponentHomes(
  uiKitSrcDir: string,
  exports: IndexExportEntry[],
  registry: Set<string>,
): Promise<Map<string, ResolvedHome>> {
  const homes = new Map<string, ResolvedHome>();

  // First pass — per-component files. A component named exactly like the
  // file basename is the canonical owner.
  for (const e of exports) {
    if (!e.isPerComponent || !e.resolvedFile || !e.resolvedDir) continue;
    const base = path.basename(e.resolvedFile, path.extname(e.resolvedFile));
    if (!registry.has(base)) continue;
    homes.set(base, {
      dir: e.resolvedDir,
      sourceFile: e.resolvedFile,
      rel: toPosix(path.relative(uiKitSrcDir, e.resolvedFile)),
      fromGroup: false,
    });
  }

  // Second pass — grouped barrel files & barrel directories. For each export
  // not yet attributed, read its named exports and attribute any registry hits.
  // When the symbol arrives via `export * from './X'` we attribute the home to
  // the ORIGIN file (where the symbol was declared), not the intermediate
  // barrel — otherwise components re-exported through a category barrel get
  // mis-attributed.
  for (const e of exports) {
    if (e.isBarrelDir && e.resolvedDir) {
      // Try to read an index.{ts,tsx} inside the dir.
      for (const ext of SOURCE_EXTS) {
        const idx = path.join(e.resolvedDir, `index${ext}`);
        if (await fs.pathExists(idx)) {
          const namesWithOrigin = await readNamedExportsWithOrigin(idx);
          for (const [name, origin] of namesWithOrigin) {
            if (!registry.has(name) || homes.has(name)) continue;
            const originDir = path.dirname(origin);
            const isPerComponentFile =
              path.basename(origin, path.extname(origin)) === name;
            homes.set(name, {
              dir: originDir,
              sourceFile: isPerComponentFile ? origin : null,
              rel: toPosix(path.relative(uiKitSrcDir, isPerComponentFile ? origin : originDir)),
              fromGroup: !isPerComponentFile,
            });
          }
          break;
        }
      }
      continue;
    }
    if (!e.isPerComponent || !e.resolvedFile || !e.resolvedDir) continue;
    const base = path.basename(e.resolvedFile, path.extname(e.resolvedFile));
    // Already mapped as canonical owner above. Now consider that the file may
    // *also* export other components (grouped barrel like `inputs.tsx`) or
    // re-export them from sibling files via `export * from './X'`.
    const namesWithOrigin = await readNamedExportsWithOrigin(e.resolvedFile);
    for (const [name, origin] of namesWithOrigin) {
      if (!registry.has(name) || homes.has(name)) continue;
      // If the symbol came from a different file (re-export), use that origin.
      const originDir = path.dirname(origin);
      const isPerComponentFile =
        path.basename(origin, path.extname(origin)) === name;
      const isOwnFile = origin === e.resolvedFile && name === base;
      homes.set(name, {
        dir: isPerComponentFile ? originDir : e.resolvedDir,
        sourceFile: isPerComponentFile ? origin : isOwnFile ? e.resolvedFile : null,
        rel: toPosix(
          path.relative(
            uiKitSrcDir,
            isPerComponentFile ? origin : e.resolvedFile,
          ),
        ),
        fromGroup: !isPerComponentFile && !isOwnFile,
      });
    }
  }

  return homes;
}

/**
 * Look up the test file for a component. Returns the absolute path, or `null`
 * if no test file is found. Search order:
 *   1. `<home>/<Component>.test.tsx`
 *   2. `<uiKitSrcDir>/__tests__/<rel-from-src>/<Component>.test.tsx`
 *   3. `<uiKitSrcDir>/__tests__/<groupName>.test.tsx`   (for grouped barrels)
 *
 * Note for (2): `<rel-from-src>` mirrors the home dir relative to src.
 */
async function findTestFile(
  uiKitSrcDir: string,
  component: string,
  home: ResolvedHome,
): Promise<string | null> {
  const candidates: string[] = [];

  candidates.push(path.join(home.dir, `${component}.test.tsx`));

  const relDir = path.relative(uiKitSrcDir, home.dir);
  // Mirror under __tests__/<relDir>/<Component>.test.tsx
  candidates.push(path.join(uiKitSrcDir, '__tests__', relDir, `${component}.test.tsx`));

  if (home.fromGroup) {
    // Grouped barrel test file: pick the basename of `rel` without extension.
    const groupName = path.basename(home.rel, path.extname(home.rel));
    if (groupName) {
      candidates.push(path.join(uiKitSrcDir, '__tests__', `${groupName}.test.tsx`));
    }
  }

  for (const c of candidates) {
    if (await fs.pathExists(c)) return c;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Gate implementation
// ---------------------------------------------------------------------------

export class CoverageComponentsGate extends Gate {
  id = 1;
  name = 'coverage-components';
  description =
    'For each export in packages/ui-kit/src/index.tsx that maps to a registered component (registry.ts), verify presence of manifest.ts, examples.tsx, and a test file.';

  async run(ctx: AuditContext): Promise<GateResult> {
    const startedAt = Date.now();

    const indexFile = path.join(ctx.uiKitSrcDir, 'index.tsx');
    if (!(await fs.pathExists(indexFile))) {
      return gateFail(
        this.name,
        [
          {
            severity: 'blocker',
            file: toPosix(indexFile),
            message: 'index.tsx not found — cannot enumerate exports.',
            suggestion: 'Ensure packages/ui-kit/src/index.tsx exists.',
          },
        ],
        Date.now() - startedAt,
      );
    }
    if (!(await fs.pathExists(ctx.registryFile))) {
      return gateFail(
        this.name,
        [
          {
            severity: 'blocker',
            file: toPosix(ctx.registryFile),
            message: 'registry.ts not found — cannot enumerate registered components.',
            suggestion: 'Ensure packages/ui-kit/src/registry.ts exists.',
          },
        ],
        Date.now() - startedAt,
      );
    }

    const registry = await readRegistry(ctx.registryFile);
    if (registry.size === 0) {
      return gateFail(
        this.name,
        [
          {
            severity: 'blocker',
            file: toPosix(ctx.registryFile),
            message: 'UI_KIT_COMPONENTS is empty or unparsable.',
            suggestion: 'Confirm registry.ts exports a non-empty UI_KIT_COMPONENTS tuple.',
          },
        ],
        Date.now() - startedAt,
      );
    }

    const indexSource = await fs.readFile(indexFile, 'utf8');
    const relPaths = parseIndexExports(indexSource);
    const entries: IndexExportEntry[] = [];
    for (const rel of relPaths) {
      entries.push(await resolveExport(ctx.uiKitSrcDir, rel));
    }

    const homes = await resolveComponentHomes(ctx.uiKitSrcDir, entries, registry);

    const findings: GateFinding[] = [];

    // Components in registry that have no `index.tsx` re-export at all.
    for (const component of registry) {
      if (!homes.has(component)) {
        findings.push({
          severity: 'blocker',
          component,
          file: toPosix(path.relative(ctx.repoRoot, indexFile)),
          message: `${component} is registered but no matching export was found in index.tsx.`,
          suggestion: `Add an export for ${component} from index.tsx or remove it from UI_KIT_COMPONENTS.`,
        });
      }
    }

    // Per-component file coverage.
    const sortedComponents = Array.from(homes.keys()).sort();
    for (const component of sortedComponents) {
      const home = homes.get(component);
      if (!home) continue;

      const manifestPath = path.join(home.dir, `${component}.manifest.ts`);
      const examplesPath = path.join(home.dir, `${component}.examples.tsx`);

      const [hasManifest, hasExamples, testFile] = await Promise.all([
        fs.pathExists(manifestPath),
        fs.pathExists(examplesPath),
        findTestFile(ctx.uiKitSrcDir, component, home),
      ]);

      if (!hasManifest) {
        findings.push({
          severity: 'blocker',
          component,
          file: toPosix(path.relative(ctx.repoRoot, manifestPath)),
          message: `Missing manifest for ${component}.`,
          suggestion: `Create ${toPosix(path.relative(ctx.repoRoot, manifestPath))} that defines a manifest via defineManifest({ name: "${component}", … }).`,
        });
      }
      if (!hasExamples) {
        findings.push({
          severity: 'major',
          component,
          file: toPosix(path.relative(ctx.repoRoot, examplesPath)),
          message: `Missing examples file for ${component}.`,
          suggestion: `Create ${toPosix(path.relative(ctx.repoRoot, examplesPath))} that exports at least one runnable example.`,
        });
      }
      if (!testFile) {
        const suggestedTest = path.join(
          ctx.uiKitSrcDir,
          '__tests__',
          path.relative(ctx.uiKitSrcDir, home.dir),
          `${component}.test.tsx`,
        );
        findings.push({
          severity: 'major',
          component,
          file: toPosix(path.relative(ctx.repoRoot, suggestedTest)),
          message: `Missing test file for ${component}.`,
          suggestion: `Add ${toPosix(path.relative(ctx.repoRoot, suggestedTest))} or a co-located ${component}.test.tsx covering at least a smoke render.`,
        });
      }
    }

    const duration = Date.now() - startedAt;
    if (findings.length === 0) return gateOk(this.name, duration);
    return gateFail(this.name, findings, duration);
  }
}

export default CoverageComponentsGate;
