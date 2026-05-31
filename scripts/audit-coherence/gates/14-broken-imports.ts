/**
 * 14-broken-imports — Static import-resolution gate.
 *
 * Scans every `.tsx` file under `apps/web/src` and `packages/ui-kit/src`,
 * extracts every import / dynamic-import / re-export specifier, and verifies
 * each specifier resolves to a real on-disk artefact (or to a declared
 * dependency for bare specifiers).
 *
 * Categories of import:
 *  - Relative (`./x`, `../y`)         — resolved against the source file's
 *                                       directory with a TS-aware extension
 *                                       probe (.ts, .tsx, .d.ts, /index.*)
 *  - Bare specifier (`react`)         — must be a declared dep / devDep /
 *                                       peerDep of the owning package OR a
 *                                       node: builtin OR a workspace package.
 *  - Workspace package (`@pxlkit/*`)  — same as bare specifier — must be a
 *                                       declared dep. Sub-paths must exist
 *                                       under the workspace package's exports.
 *  - tsconfig path alias              — resolved using the closest tsconfig's
 *                                       `paths` mapping; if no mapping covers
 *                                       it, treated as an unknown bare
 *                                       specifier (and therefore a finding).
 *
 * Blockers: any import that fails to resolve produces a `blocker` finding,
 * because a broken import means the code does not compile / cannot ship.
 *
 * Programmatic API:
 *   const gate = new BrokenImportsGate();
 *   const result = await gate.run(ctx);
 *
 * CLI (thin wrapper):
 *   tsx scripts/audit-coherence/gates/14-broken-imports.ts [--root <dir>] [--json]
 *
 * Exit codes: 0 if all imports resolve, 1 otherwise.
 *
 * Safety: read-only. Touches no files. Does not spawn external processes.
 */

import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

import { glob as fgGlob } from 'fast-glob';
import * as fs from 'fs-extra';
import * as pc from 'picocolors';

import {
  Gate,
  gateFail,
  gateOk,
  type AuditContext,
  type GateFinding,
  type GateResult,
} from '../_lib/gate-base.js';
import { createLogger, loadAuditContext } from '../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ImportKind = 'static' | 'dynamic' | 'reexport';

export interface ImportSpec {
  /** The string literal as written, e.g. `./Button`, `react`, `@pxlkit/ui-kit/x`. */
  specifier: string;
  /** Which AST shape produced it. */
  kind: ImportKind;
  /** 1-based line where the import begins (best-effort). */
  line: number;
}

export interface SourceFile {
  /** Absolute, normalised file path. */
  file: string;
  /** Raw file contents (utf-8). */
  content: string;
}

export interface PackageManifest {
  /** Absolute path to the package.json. */
  pkgJsonPath: string;
  /** Absolute path to the package root (dirname of pkgJsonPath). */
  pkgDir: string;
  /** Declared `name` (or null for workspace packages without one). */
  name: string | null;
  /** Union of dependencies / devDependencies / peerDependencies / optionalDependencies. */
  deps: Set<string>;
}

export interface TsconfigPaths {
  /** Absolute path of the tsconfig.json this came from. */
  tsconfigPath: string;
  /** Absolute baseUrl (or the tsconfig's own directory if baseUrl absent). */
  baseUrl: string;
  /** Map of alias glob → array of target globs (each resolved against baseUrl). */
  paths: Map<string, string[]>;
}

export interface BrokenImportsGateOptions {
  /** Override file discovery (used by tests). */
  discoverFiles?: (ctx: AuditContext) => Promise<SourceFile[]>;
  /**
   * Override the resolver. When omitted, the gate uses the bundled resolver
   * that consults `node:fs` and the per-file owning package.json.
   */
  resolveImport?: (input: ResolveImportInput) => Promise<ResolveImportResult>;
}

export interface ResolveImportInput {
  fromFile: string;
  spec: ImportSpec;
  ctx: AuditContext;
}

export type ResolveImportResult =
  | { ok: true; resolved: string; reason?: string }
  | { ok: false; reason: string; suggestion?: string };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GATE_NAME = 'broken-imports';

const SCAN_GLOBS = [
  'apps/web/src/**/*.tsx',
  'packages/ui-kit/src/**/*.tsx',
];

const SCAN_IGNORE = [
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/__tests__/**',
  // Tooling-only files: their imports reach for dev-deps (vitest, storybook,
  // test-utils) that may not be declared in the owning package — those leaks
  // are caught by separate gates, not by import-resolution.
  '**/*.test.tsx',
  '**/*.spec.tsx',
  '**/*.stories.tsx',
];

// Common TS/JS extensions to probe when a relative import omits the extension.
const RESOLUTION_EXTENSIONS = ['.tsx', '.ts', '.d.ts', '.jsx', '.js', '.mjs', '.cjs', '.json'];
const INDEX_BASENAMES = RESOLUTION_EXTENSIONS.map((ext) => `index${ext}`);

// Node builtins that should always resolve without needing to be declared.
const NODE_BUILTINS = new Set([
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster', 'console',
  'constants', 'crypto', 'dgram', 'diagnostics_channel', 'dns', 'domain',
  'events', 'fs', 'fs/promises', 'http', 'http2', 'https', 'inspector',
  'module', 'net', 'os', 'path', 'path/posix', 'path/win32', 'perf_hooks',
  'process', 'punycode', 'querystring', 'readline', 'repl', 'stream',
  'stream/consumers', 'stream/promises', 'stream/web', 'string_decoder',
  'sys', 'timers', 'timers/promises', 'tls', 'trace_events', 'tty', 'url',
  'util', 'util/types', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib',
]);

// Side-effect / "magic" specifiers that we treat as always-resolved because
// they're handled by bundlers/loaders rather than by Node module resolution.
const VIRTUAL_SPECIFIER_PREFIXES = [
  'virtual:',
  '~icons/',
  'astro:',
  // Vite/Next CSS/asset imports
];
const ALLOWED_EXTENSION_ONLY = new Set([
  '.css', '.scss', '.sass', '.less', '.svg', '.png', '.jpg', '.jpeg',
  '.gif', '.webp', '.avif', '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.mp3', '.mp4', '.webm', '.wav', '.ogg', '.json',
]);

// Static & dynamic import / re-export regexes. We use a careful set instead
// of a real parser to stay dependency-free; tests cover the shapes we expect.
//
// We intentionally accept either single or double quotes, and we tolerate
// whitespace + newlines.
const RE_STATIC_IMPORT =
  /(?:^|[\s;])import\s+(?:[\s\S]*?from\s+)?(['"])(?<spec>[^'"]+)\1/gm;
const RE_BARE_IMPORT =
  /(?:^|[\s;])import\s+(['"])(?<spec>[^'"]+)\1/gm; // for side-effect-only imports
const RE_REEXPORT =
  /(?:^|[\s;])export\s+(?:\*|\{[\s\S]*?\})\s+from\s+(['"])(?<spec>[^'"]+)\1/gm;
const RE_DYNAMIC_IMPORT = /import\s*\(\s*(['"])(?<spec>[^'"]+)\1\s*\)/gm;

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join('/').replace(/\\/g, '/');
}

/** Normalise a filesystem path for case/separator-insensitive comparison on Windows. */
function normCmp(p: string): string {
  return toPosix(path.resolve(p)).toLowerCase();
}

function lineOf(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < content.length; i++) {
    if (content.charCodeAt(i) === 10) line++;
  }
  return line;
}

/**
 * Strip comments AND blank out template-literal contents to avoid matching
 * specifiers in commented-out code or in documentation code-block strings.
 *
 * We preserve byte offsets and newlines so regex match indices still map
 * back to real source lines. Single- and double-quoted strings are kept
 * verbatim (they're short, single-line, and the import regexes need their
 * specifier literals intact).
 */
function stripComments(src: string): string {
  let out = '';
  let i = 0;
  let inString: '"' | "'" | '`' | null = null;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (inString === '`') {
      // Inside a template literal: blank everything except newlines and the
      // closing backtick. This prevents `import ... from './x'` inside a
      // documentation code-block string from registering as a real import.
      if (ch === '\\' && i + 1 < src.length) {
        out += '  ';
        i += 2;
        continue;
      }
      if (ch === '`') {
        out += ch;
        inString = null;
        i++;
        continue;
      }
      out += ch === '\n' ? '\n' : ' ';
      i++;
      continue;
    }
    if (inString) {
      out += ch;
      if (ch === '\\' && i + 1 < src.length) {
        out += src[i + 1];
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch as '"' | "'" | '`';
      out += ch;
      i++;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') {
        out += src[i] === '\n' ? '\n' : ' ';
        i++;
      }
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end === -1 ? src.length : end + 2;
      for (let j = i; j < stop; j++) {
        out += src[j] === '\n' ? '\n' : ' ';
      }
      i = stop;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

export function extractImports(content: string): ImportSpec[] {
  const cleaned = stripComments(content);
  // Dedup is keyed on byte-offset (a.k.a. match index) so two identical
  // specifiers on adjacent lines don't collapse into one. We still report
  // the human-friendly 1-based line number.
  const seen = new Map<string, ImportSpec>();
  const collect = (re: RegExp, kind: ImportKind) => {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(cleaned)) !== null) {
      const spec = m.groups?.spec;
      if (!spec) continue;
      const line = lineOf(cleaned, m.index);
      const key = `${kind}::${spec}::${m.index}`;
      if (!seen.has(key)) seen.set(key, { specifier: spec, kind, line });
    }
  };
  collect(RE_STATIC_IMPORT, 'static');
  collect(RE_BARE_IMPORT, 'static');
  collect(RE_REEXPORT, 'reexport');
  collect(RE_DYNAMIC_IMPORT, 'dynamic');
  return Array.from(seen.values()).sort((a, b) => a.line - b.line);
}

// ---------------------------------------------------------------------------
// Package + tsconfig discovery
// ---------------------------------------------------------------------------

const pkgCache = new Map<string, PackageManifest | null>();

/**
 * Workspace package map: package name (e.g. `@pxlkit/ui-kit`) → absolute
 * package.json path. Built lazily on first use per repoRoot.
 */
const workspaceMapCache = new Map<string, Map<string, string>>();

async function buildWorkspaceMap(repoRoot: string): Promise<Map<string, string>> {
  const rootKey = toPosix(path.resolve(repoRoot));
  const cached = workspaceMapCache.get(rootKey);
  if (cached) return cached;

  const map = new Map<string, string>();
  // Read root package.json "workspaces" globs; fall back to packages/* + apps/*.
  let globs: string[] = ['packages/*', 'apps/*'];
  try {
    const rootPkgPath = path.join(rootKey, 'package.json');
    if (await fs.pathExists(rootPkgPath)) {
      const json = (await fs.readJson(rootPkgPath)) as Record<string, unknown>;
      const ws = json.workspaces;
      if (Array.isArray(ws)) {
        globs = ws.filter((x): x is string => typeof x === 'string');
      } else if (ws && typeof ws === 'object' && Array.isArray((ws as { packages?: unknown }).packages)) {
        globs = (ws as { packages: unknown[] }).packages.filter(
          (x): x is string => typeof x === 'string',
        );
      }
    }
  } catch {
    /* fall through with defaults */
  }
  const pkgJsonGlobs = globs.map((g) => `${g.replace(/\/$/, '')}/package.json`);
  const pkgJsonPaths = await fgGlob(pkgJsonGlobs, {
    cwd: rootKey,
    absolute: true,
    onlyFiles: true,
    ignore: ['**/node_modules/**'],
  });
  for (const p of pkgJsonPaths) {
    try {
      const json = (await fs.readJson(p)) as { name?: string };
      if (json.name && typeof json.name === 'string') {
        map.set(json.name, toPosix(p));
      }
    } catch {
      /* ignore */
    }
  }
  workspaceMapCache.set(rootKey, map);
  return map;
}

function readPkgDeps(pkgJson: Record<string, unknown>): Set<string> {
  const set = new Set<string>();
  const keys: Array<keyof typeof pkgJson> = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ];
  for (const k of keys) {
    const block = pkgJson[k];
    if (block && typeof block === 'object') {
      for (const name of Object.keys(block as Record<string, unknown>)) {
        set.add(name);
      }
    }
  }
  return set;
}

export async function findOwningPackage(
  fromFile: string,
  repoRoot: string,
): Promise<PackageManifest | null> {
  // Normalise both sides — fast-glob returns forward slashes on Windows but
  // path.resolve produces backslashes, which broke startsWith().
  let dir = toPosix(path.dirname(fromFile));
  const root = toPosix(path.resolve(repoRoot));
  const dirLower = () => dir.toLowerCase();
  const rootLower = root.toLowerCase();
  while (dirLower().startsWith(rootLower) && dir.length >= root.length) {
    if (pkgCache.has(dir)) {
      const cached = pkgCache.get(dir);
      if (cached) return cached;
    } else {
      const candidate = path.join(dir, 'package.json');
      if (await fs.pathExists(candidate)) {
        try {
          const json = (await fs.readJson(candidate)) as Record<string, unknown>;
          const manifest: PackageManifest = {
            pkgJsonPath: candidate,
            pkgDir: dir,
            name: typeof json.name === 'string' ? json.name : null,
            deps: readPkgDeps(json),
          };
          pkgCache.set(dir, manifest);
          return manifest;
        } catch {
          pkgCache.set(dir, null);
        }
      }
    }
    const parent = toPosix(path.dirname(dir));
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const tsconfigCache = new Map<string, TsconfigPaths | null>();

async function loadTsconfigChain(
  fromDir: string,
  repoRoot: string,
): Promise<TsconfigPaths | null> {
  let dir = toPosix(fromDir);
  const root = toPosix(path.resolve(repoRoot));
  const rootLower = root.toLowerCase();
  while (dir.toLowerCase().startsWith(rootLower) && dir.length >= root.length) {
    if (tsconfigCache.has(dir)) {
      const c = tsconfigCache.get(dir);
      if (c) return c;
    } else {
      const candidate = path.join(dir, 'tsconfig.json');
      if (await fs.pathExists(candidate)) {
        const parsed = await parseTsconfig(candidate);
        tsconfigCache.set(dir, parsed);
        if (parsed) return parsed;
      } else {
        tsconfigCache.set(dir, null);
      }
    }
    const parent = toPosix(path.dirname(dir));
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

async function parseTsconfig(file: string): Promise<TsconfigPaths | null> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    // tsconfig allows comments + trailing commas. Strip them carefully:
    // stripComments() preserves string contents (so "@/*" doesn't get eaten
    // as the start of a block comment).
    const cleaned = stripComments(raw).replace(/,\s*([}\]])/g, '$1');
    const json = JSON.parse(cleaned) as {
      compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> };
    };
    const dir = path.dirname(file);
    const baseUrl = json.compilerOptions?.baseUrl
      ? path.resolve(dir, json.compilerOptions.baseUrl)
      : dir;
    const paths = new Map<string, string[]>();
    const rawPaths = json.compilerOptions?.paths ?? {};
    for (const [alias, targets] of Object.entries(rawPaths)) {
      if (Array.isArray(targets)) {
        paths.set(
          alias,
          targets.filter((t): t is string => typeof t === 'string'),
        );
      }
    }
    return { tsconfigPath: file, baseUrl, paths };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Resolver
// ---------------------------------------------------------------------------

async function resolveRelative(
  fromFile: string,
  specifier: string,
): Promise<ResolveImportResult> {
  const fromDir = path.dirname(fromFile);
  const target = path.resolve(fromDir, specifier);

  // If specifier already has an extension we recognise, only check it directly.
  const ext = path.extname(target).toLowerCase();
  if (ext && (RESOLUTION_EXTENSIONS.includes(ext) || ALLOWED_EXTENSION_ONLY.has(ext))) {
    if (await fs.pathExists(target)) {
      return { ok: true, resolved: target };
    }
    return {
      ok: false,
      reason: `relative import points at ${toPosix(target)} which does not exist`,
      suggestion: 'Check the file path / casing, or remove the import.',
    };
  }

  // Probe extension variants.
  for (const e of RESOLUTION_EXTENSIONS) {
    const probe = `${target}${e}`;
    if (await fs.pathExists(probe)) {
      return { ok: true, resolved: probe };
    }
  }
  // Probe index.* variants.
  if (await fs.pathExists(target)) {
    const stat = await fs.stat(target);
    if (stat.isDirectory()) {
      for (const base of INDEX_BASENAMES) {
        const probe = path.join(target, base);
        if (await fs.pathExists(probe)) {
          return { ok: true, resolved: probe };
        }
      }
    } else {
      return { ok: true, resolved: target };
    }
  }
  return {
    ok: false,
    reason: `relative import "${specifier}" did not resolve from ${toPosix(fromFile)}`,
    suggestion:
      'Verify the target file exists, the extension is implied correctly, or the directory has an index file.',
  };
}

function parsePackageSpecifier(spec: string): { pkg: string; subpath: string } {
  if (spec.startsWith('@')) {
    // scoped: @scope/name[/sub]
    const parts = spec.split('/');
    if (parts.length < 2) return { pkg: spec, subpath: '' };
    const pkg = `${parts[0]}/${parts[1]}`;
    const subpath = parts.slice(2).join('/');
    return { pkg, subpath };
  }
  const idx = spec.indexOf('/');
  if (idx === -1) return { pkg: spec, subpath: '' };
  return { pkg: spec.slice(0, idx), subpath: spec.slice(idx + 1) };
}

async function resolveBare(
  fromFile: string,
  specifier: string,
  ctx: AuditContext,
): Promise<ResolveImportResult> {
  // node:* always passes.
  if (specifier.startsWith('node:')) {
    return { ok: true, resolved: specifier };
  }
  if (NODE_BUILTINS.has(specifier)) {
    return { ok: true, resolved: specifier };
  }
  for (const prefix of VIRTUAL_SPECIFIER_PREFIXES) {
    if (specifier.startsWith(prefix)) {
      return { ok: true, resolved: specifier };
    }
  }
  const { pkg, subpath } = parsePackageSpecifier(specifier);

  // 1. tsconfig path alias?
  const tsconfig = await loadTsconfigChain(path.dirname(fromFile), ctx.repoRoot);
  if (tsconfig) {
    for (const [alias, targets] of tsconfig.paths) {
      const aliasNoStar = alias.replace(/\*$/, '');
      const isPrefix = alias.endsWith('*');
      const matches = isPrefix ? specifier.startsWith(aliasNoStar) : specifier === alias;
      if (!matches) continue;
      const remainder = isPrefix ? specifier.slice(aliasNoStar.length) : '';
      for (const target of targets) {
        const targetNoStar = target.replace(/\*$/, '');
        const expanded = path.resolve(tsconfig.baseUrl, targetNoStar + remainder);
        const probed = await resolveRelative(
          path.join(path.dirname(expanded), '__virtual__.tsx'),
          `./${path.basename(expanded)}`,
        );
        if (probed.ok) {
          return { ok: true, resolved: probed.resolved };
        }
      }
      return {
        ok: false,
        reason: `tsconfig path alias "${alias}" matched "${specifier}" but no target file exists`,
        suggestion: `Adjust tsconfig (${toPosix(tsconfig.tsconfigPath)}) or add the missing file.`,
      };
    }
  }

  // 2. workspace package? (any workspace whose declared name === pkg)
  const workspaceMap = await buildWorkspaceMap(ctx.repoRoot);
  if (workspaceMap.has(pkg)) {
    // Resolves regardless of dep declaration — npm workspaces hoist these
    // transparently, and the audit's other gates check dep coherence.
    const _ = subpath; // currently informational only (no exports-map emulation)
    return { ok: true, resolved: workspaceMap.get(pkg)! };
  }

  // 3. external package — must be declared by the owning package or by the
  //    repo root package.json. We also accept declarations in any workspace
  //    package.json on the walk-up path (npm workspaces hoist node_modules).
  const owning = await findOwningPackage(fromFile, ctx.repoRoot);
  const rootPkgPath = path.join(ctx.repoRoot, 'package.json');
  let rootDeps: Set<string> = new Set();
  try {
    if (await fs.pathExists(rootPkgPath)) {
      const json = (await fs.readJson(rootPkgPath)) as Record<string, unknown>;
      rootDeps = readPkgDeps(json);
    }
  } catch {
    /* ignore */
  }
  const declaredHere = owning?.deps.has(pkg) ?? false;
  const declaredAtRoot = rootDeps.has(pkg);
  if (declaredHere || declaredAtRoot) {
    return { ok: true, resolved: specifier };
  }

  return {
    ok: false,
    reason: `bare import "${specifier}" (pkg "${pkg}") is not a declared dependency of ${
      owning?.name ?? toPosix(owning?.pkgDir ?? ctx.repoRoot)
    } or the root package.json`,
    suggestion: `Add "${pkg}" to the appropriate package.json dependencies block, or remove the import.`,
  };
}

export const defaultResolver = async (
  input: ResolveImportInput,
): Promise<ResolveImportResult> => {
  const { fromFile, spec, ctx } = input;
  const s = spec.specifier;
  if (s.startsWith('./') || s.startsWith('../') || s === '.' || s === '..') {
    return resolveRelative(fromFile, s);
  }
  if (s.startsWith('/')) {
    // Absolute path imports are almost never correct in this codebase.
    if (await fs.pathExists(s)) {
      return { ok: true, resolved: s };
    }
    return {
      ok: false,
      reason: `absolute filesystem import "${s}" does not exist`,
      suggestion: 'Convert to a relative import or an alias.',
    };
  }
  return resolveBare(fromFile, s, ctx);
};

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

async function discoverFilesDefault(ctx: AuditContext): Promise<SourceFile[]> {
  const files = await fgGlob(SCAN_GLOBS, {
    cwd: ctx.repoRoot,
    absolute: true,
    onlyFiles: true,
    dot: false,
    ignore: SCAN_IGNORE,
  });
  const out: SourceFile[] = [];
  for (const file of files.sort()) {
    try {
      const content = await fs.readFile(file, 'utf8');
      out.push({ file, content });
    } catch (err) {
      ctx.logger.debug(
        `skip unreadable file ${file}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export class BrokenImportsGate extends Gate {
  readonly id = 14;
  readonly name = GATE_NAME;
  readonly description =
    'Scan all .tsx in apps/web/src and packages/ui-kit/src for import paths. Verify each resolves to an actual file. Blocker on broken imports.';

  private readonly discover: (ctx: AuditContext) => Promise<SourceFile[]>;
  private readonly resolveImport: (
    input: ResolveImportInput,
  ) => Promise<ResolveImportResult>;

  constructor(options: BrokenImportsGateOptions = {}) {
    super();
    this.discover = options.discoverFiles ?? discoverFilesDefault;
    this.resolveImport = options.resolveImport ?? defaultResolver;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const start = Date.now();
    const files = await this.discover(ctx);

    if (files.length === 0) {
      ctx.logger.debug('no .tsx files in scan scope — gate passes vacuously');
      return gateOk(this.name, Date.now() - start);
    }

    const findings: GateFinding[] = [];

    for (const src of files) {
      const imports = extractImports(src.content);
      if (imports.length === 0) continue;

      for (const spec of imports) {
        let result: ResolveImportResult;
        try {
          result = await this.resolveImport({ fromFile: src.file, spec, ctx });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          findings.push({
            severity: 'blocker',
            file: toPosix(src.file),
            component: path.basename(src.file).replace(/\.tsx$/, ''),
            message: `resolver threw on "${spec.specifier}" (line ${spec.line}): ${message}`,
            suggestion:
              'Inspect the import manually; the resolver should never throw — file a bug if this persists.',
          });
          continue;
        }
        if (result.ok) {
          ctx.logger.debug(
            `${toPosix(src.file)}:${spec.line} ${spec.specifier} → ${toPosix(result.resolved)}`,
          );
          continue;
        }
        findings.push({
          severity: 'blocker',
          file: toPosix(src.file),
          component: path.basename(src.file).replace(/\.tsx$/, ''),
          message: `${spec.kind} import "${spec.specifier}" at line ${spec.line} did not resolve — ${result.reason}`,
          suggestion: result.suggestion,
        });
      }
    }

    if (findings.length === 0) {
      return gateOk(this.name, Date.now() - start);
    }
    return gateFail(this.name, findings, Date.now() - start);
  }
}

// ---------------------------------------------------------------------------
// CLI wrapper
// ---------------------------------------------------------------------------

interface CliOptions {
  root: string;
  json: boolean;
  quiet: boolean;
}

function parseCliArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { root: process.cwd(), json: false, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--root' || arg === '-r') {
      const next = argv[i + 1];
      if (!next) throw new Error('--root requires a value');
      opts.root = path.resolve(next);
      i++;
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg === '--quiet' || arg === '-q') {
      opts.quiet = true;
    } else if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        [
          'Usage: tsx scripts/audit-coherence/gates/14-broken-imports.ts [options]',
          '',
          'Options:',
          '  --root, -r <dir>   Repo root to audit (default: cwd)',
          '  --json             Emit JSON GateResult on stdout',
          '  --quiet, -q        Suppress non-JSON log output',
          '  --help, -h         Show this help',
          '',
        ].join('\n'),
      );
      process.exit(0);
    }
  }
  return opts;
}

async function cliMain(argv: string[]): Promise<number> {
  const opts = parseCliArgs(argv);
  const logger = createLogger(!opts.quiet);
  const ctx = await loadAuditContext(opts.root, { logger });
  const gate = new BrokenImportsGate();
  const result = await gate.run(ctx);
  if (opts.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (!opts.quiet) {
    const badge = result.passed ? pc.green('PASS') : pc.red('FAIL');
    process.stdout.write(`${badge} ${result.name} (${result.duration_ms}ms)\n`);
    for (const f of result.findings) {
      process.stdout.write(
        `  ${pc.yellow(f.severity)} ${f.component ?? '?'} ${f.file ?? ''}\n    ${f.message}\n`,
      );
      if (f.suggestion) {
        process.stdout.write(`    ${pc.dim('-> ' + f.suggestion)}\n`);
      }
    }
  }
  return result.passed ? 0 : 1;
}

const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedDirectly) {
  cliMain(process.argv.slice(2))
    .then((code) => process.exit(code))
    .catch((err) => {
      process.stderr.write(
        `broken-imports failed: ${err instanceof Error ? err.stack ?? err.message : String(err)}\n`,
      );
      process.exit(1);
    });
}

export default BrokenImportsGate;
