/**
 * Gate 18 — orphan-files
 *
 * Any `.tsx` file in `packages/ui-kit/src` that:
 *   - is NOT a test (`*.test.tsx`, `*.test.ts`, under `__tests__/**`)
 *   - is NOT a story (`*.stories.tsx`)
 *   - is NOT an example (`*.examples.tsx`)
 *   - is NOT a manifest (`*.manifest.ts` — already filtered by .tsx-only)
 *   - EXPORTS at least one React component (named export matching the
 *     `Pixel*` / `PxlKit*` convention, or a default-exported component)
 *   - is NEITHER registered in `registry.ts` (`UI_KIT_COMPONENTS`) NOR
 *     re-exported (transitively, through a single hop) from
 *     `packages/ui-kit/src/index.tsx`
 *
 * …is flagged as an orphan with severity `major`.
 *
 * Rationale: Ola 4c work fragmented grouped barrels into per-component files.
 * Forgetting to register a component or re-export it from the barrel is a
 * silent regression — the file lives on disk, looks fine in code review, but
 * never reaches consumers. Same goes for stale/dead components left over from
 * a refactor that nobody removed.
 *
 * Programmatic API:
 *   const gate = new OrphanFilesGate();
 *   const result = await gate.run(ctx);
 *
 * Safety: read-only. Only globs and reads files; never imports executable code.
 */

import * as path from 'node:path';
import { glob as fgGlob } from 'fast-glob';
import * as fs from 'fs-extra';

import {
  Gate,
  gateFail,
  gateOk,
  type AuditContext,
  type GateFinding,
  type GateResult,
} from '../_lib/gate-base.js';

// ---------------------------------------------------------------------------
// Conventions
// ---------------------------------------------------------------------------

const COMPONENT_PREFIXES = ['Pixel', 'PxlKit'];

function looksLikeComponentName(s: string): boolean {
  return COMPONENT_PREFIXES.some((p) => s.startsWith(p));
}

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

// ---------------------------------------------------------------------------
// Registry / index parsing — duplicated locally so this gate has no coupling
// to the internals of gate 01.
// ---------------------------------------------------------------------------

/**
 * Parse `registry.ts` for the `UI_KIT_COMPONENTS` tuple. Regex-based to avoid
 * importing TS source at audit time.
 */
export async function readRegistry(registryFile: string): Promise<Set<string>> {
  const out = new Set<string>();
  let raw: string;
  try {
    raw = await fs.readFile(registryFile, 'utf8');
  } catch {
    return out;
  }
  const start = raw.indexOf('UI_KIT_COMPONENTS');
  if (start < 0) return out;
  const lbracket = raw.indexOf('[', start);
  const rbracket = raw.indexOf(']', lbracket);
  if (lbracket < 0 || rbracket < 0) return out;
  const inside = raw.slice(lbracket + 1, rbracket);
  const matches = inside.match(/['"]([A-Za-z][A-Za-z0-9_]*)['"]/g) ?? [];
  for (const m of matches) {
    const name = m.slice(1, -1);
    if (looksLikeComponentName(name)) out.add(name);
  }
  return out;
}

/**
 * Parse a file's `export * from`, `export { … } from`, and `export type …
 * from` statements. Returns the set of relative module specifiers.
 */
export function parseReExports(source: string): {
  starFrom: string[];
  namedFrom: Array<{ rel: string; names: string[] }>;
} {
  const starFrom = new Set<string>();
  const namedFrom: Array<{ rel: string; names: string[] }> = [];

  const rxStar = /export\s+\*\s+(?:as\s+\w+\s+)?from\s+['"]([^'"\n]+)['"]/g;
  const rxNamed = /export\s*\{([^}]*)\}\s*from\s+['"]([^'"\n]+)['"]/g;
  const rxTypeFrom = /export\s+type\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"\n]+)['"]/g;

  let m: RegExpExecArray | null;
  while ((m = rxStar.exec(source)) !== null) {
    const rel = m[1];
    if (rel) starFrom.add(rel);
  }
  while ((m = rxNamed.exec(source)) !== null) {
    const body = m[1];
    const rel = m[2];
    if (!rel) continue;
    const names: string[] = [];
    for (const part of body.split(',')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const noType = trimmed.replace(/^type\s+/, '');
      const asMatch = /\bas\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*$/.exec(noType);
      const id = asMatch ? asMatch[1] : noType.replace(/\s.*$/, '');
      if (id && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(id)) names.push(id);
    }
    namedFrom.push({ rel, names });
  }
  while ((m = rxTypeFrom.exec(source)) !== null) {
    const rel = m[1];
    if (rel) starFrom.add(rel); // treat type re-exports as a star (we only need "this file is referenced")
  }
  return { starFrom: Array.from(starFrom), namedFrom };
}

/**
 * Resolve a relative module specifier against `uiKitSrcDir`. Returns the
 * absolute file path (with extension) for a `.tsx`/`.ts` target, or the
 * absolute directory path for a barrel target. Returns `null` if neither
 * resolves.
 */
async function resolveSpecifier(
  uiKitSrcDir: string,
  fromFile: string,
  rel: string,
): Promise<string | null> {
  // Treat both index-relative and file-relative specifiers correctly.
  const baseDir = path.dirname(fromFile);
  const baseAbs = path.resolve(baseDir, rel);
  for (const ext of ['.tsx', '.ts']) {
    const candidate = baseAbs + ext;
    if (await fs.pathExists(candidate)) return candidate;
  }
  if (await fs.pathExists(baseAbs)) {
    const stat = await fs.stat(baseAbs);
    if (stat.isDirectory()) {
      for (const ext of ['.tsx', '.ts']) {
        const idx = path.join(baseAbs, `index${ext}`);
        if (await fs.pathExists(idx)) return idx;
      }
      return baseAbs;
    }
  }
  // Fallback: try uiKitSrcDir-rooted specifier (shouldn't normally happen for
  // ./-style specifiers but defensively supported).
  const altBase = path.resolve(uiKitSrcDir, rel);
  for (const ext of ['.tsx', '.ts']) {
    const candidate = altBase + ext;
    if (await fs.pathExists(candidate)) return candidate;
  }
  return null;
}

/**
 * Walk `index.tsx` and (one hop) any barrel files it re-exports from. Returns
 * the set of absolute file paths that are reachable from index.tsx. A file
 * being reachable means anything it exports leaves the package boundary.
 */
export async function collectReachableFiles(
  uiKitSrcDir: string,
  indexFile: string,
): Promise<Set<string>> {
  const reachable = new Set<string>();
  if (!(await fs.pathExists(indexFile))) return reachable;

  const queue: string[] = [indexFile];
  const seen = new Set<string>();
  while (queue.length > 0) {
    const file = queue.shift()!;
    if (seen.has(file)) continue;
    seen.add(file);
    let raw: string;
    try {
      raw = await fs.readFile(file, 'utf8');
    } catch {
      continue;
    }
    const { starFrom, namedFrom } = parseReExports(raw);
    const allSpecs = [...starFrom, ...namedFrom.map((n) => n.rel)];
    for (const rel of allSpecs) {
      const resolved = await resolveSpecifier(uiKitSrcDir, file, rel);
      if (!resolved) continue;
      reachable.add(resolved);
      // One-hop barrel walk: if the resolved file is a barrel (e.g. an
      // index.ts/index.tsx in a directory like `cards/`), follow its
      // re-exports too — otherwise a per-component file behind a barrel dir
      // would appear orphan.
      const base = path.basename(resolved, path.extname(resolved));
      if (base === 'index') {
        queue.push(resolved);
      }
      // Also follow grouped barrel files that themselves do further re-exports
      // (some packages have e.g. `actions.tsx` that re-exports from
      // `./actions/PixelButton`). Cheap to enqueue; `seen` prevents cycles.
      queue.push(resolved);
    }
  }
  return reachable;
}

// ---------------------------------------------------------------------------
// Component export detection
// ---------------------------------------------------------------------------

/**
 * Heuristically detect component exports from a single .tsx file. We look at:
 *   - `export const Foo = (...)` / `= () =>` / `= forwardRef(`
 *   - `export function Foo(`
 *   - `export default function Foo(`
 *   - `export default Foo`  (with Foo previously declared)
 *   - `export { Foo, Bar as Baz }`
 *
 * Anything whose identifier matches `looksLikeComponentName()` is treated as
 * a component. We deliberately do NOT verify JSX in the body — manifests +
 * registry are the source of truth; this gate is about reachability.
 */
export function detectComponentExports(source: string): {
  named: Set<string>;
  hasDefaultComponent: boolean;
} {
  const named = new Set<string>();
  let hasDefaultComponent = false;

  const rxDecl = /export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  let m: RegExpExecArray | null;
  while ((m = rxDecl.exec(source)) !== null) {
    if (looksLikeComponentName(m[1])) named.add(m[1]);
  }

  const rxBlock = /export\s*\{([^}]+)\}(?!\s*from)/g;
  while ((m = rxBlock.exec(source)) !== null) {
    const body = m[1];
    for (const part of body.split(',')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const noType = trimmed.replace(/^type\s+/, '');
      const asMatch = /\bas\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*$/.exec(noType);
      const id = asMatch ? asMatch[1] : noType.replace(/\s.*$/, '');
      if (id && looksLikeComponentName(id)) named.add(id);
    }
  }

  const rxDefaultFn = /export\s+default\s+function\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  while ((m = rxDefaultFn.exec(source)) !== null) {
    if (looksLikeComponentName(m[1])) hasDefaultComponent = true;
  }

  const rxDefaultId = /export\s+default\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*;?/g;
  while ((m = rxDefaultId.exec(source)) !== null) {
    if (looksLikeComponentName(m[1])) hasDefaultComponent = true;
  }

  return { named, hasDefaultComponent };
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

const EXCLUDE_GLOBS = [
  '**/__tests__/**',
  '**/*.test.tsx',
  '**/*.test.ts',
  '**/*.stories.tsx',
  '**/*.examples.tsx',
  '**/node_modules/**',
  '**/dist/**',
];

export class OrphanFilesGate extends Gate {
  id = 18;
  name = 'orphan-files';
  description =
    'Any .tsx in packages/ui-kit/src that is NOT a test, story, example, manifest, or registered export, AND that EXPORTS a React component, is an orphan. Major.';

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    if (!(await fs.pathExists(ctx.uiKitSrcDir))) {
      // No ui-kit src — nothing to scan. Pass vacuously.
      return gateOk(this.name, Date.now() - started);
    }

    const indexFile = path.join(ctx.uiKitSrcDir, 'index.tsx');
    const registry = await readRegistry(ctx.registryFile);
    const reachable = await collectReachableFiles(ctx.uiKitSrcDir, indexFile);

    const srcPosix = toPosix(ctx.uiKitSrcDir);
    const tsxFiles = await fgGlob(`${srcPosix}/**/*.tsx`, {
      absolute: true,
      onlyFiles: true,
      dot: false,
      ignore: EXCLUDE_GLOBS,
    });

    for (const file of tsxFiles) {
      // Skip the entry point itself — it's allowed to live un-referenced
      // (it IS the reference).
      if (path.resolve(file) === path.resolve(indexFile)) continue;

      let raw: string;
      try {
        raw = await fs.readFile(file, 'utf8');
      } catch {
        continue;
      }
      const { named, hasDefaultComponent } = detectComponentExports(raw);
      const components = Array.from(named);
      if (components.length === 0 && !hasDefaultComponent) continue;

      const isReachable = reachable.has(path.resolve(file));
      const componentsRegistered = components.filter((c) => registry.has(c));
      const allComponentsRegistered =
        components.length > 0 && componentsRegistered.length === components.length;

      if (isReachable) continue;
      if (allComponentsRegistered && !hasDefaultComponent) {
        // Registered name but not re-exported from index.tsx is still an
        // orphan: registration alone doesn't expose the component to
        // consumers. Surface a more specific message.
        const relFile = toPosix(path.relative(ctx.repoRoot, file));
        findings.push({
          severity: 'major',
          file: relFile,
          component: components[0],
          message: `${relFile} exports ${components.join(', ')} which is registered in registry.ts but never re-exported from index.tsx — orphan in the public surface.`,
          suggestion: `Add an \`export * from './${toPosix(
            path.relative(ctx.uiKitSrcDir, file).replace(/\.tsx$/, ''),
          )}';\` line to packages/ui-kit/src/index.tsx (or remove the file if it is dead code).`,
        });
        continue;
      }

      const relFile = toPosix(path.relative(ctx.repoRoot, file));
      const componentLabel =
        components.length > 0 ? components.join(', ') : '<default-export>';
      findings.push({
        severity: 'major',
        file: relFile,
        component: components[0],
        message: `${relFile} exports component(s) ${componentLabel} but is neither registered in registry.ts nor reachable from packages/ui-kit/src/index.tsx — orphan.`,
        suggestion: `Either (a) add ${
          components[0] ?? '<ComponentName>'
        } to UI_KIT_COMPONENTS in registry.ts AND export it from index.tsx, or (b) delete ${relFile} if it is dead code.`,
      });
    }

    const duration = Date.now() - started;
    return findings.length === 0
      ? gateOk(this.name, duration)
      : gateFail(this.name, findings, duration);
  }
}

export default OrphanFilesGate;
