/**
 * Gate 16 — monorepo-map.
 *
 * Verifies that the root `README.md` documents every workspace declared in
 * the root `package.json`'s `workspaces` field, by reading the section
 * delimited by these two markers:
 *
 *   <!-- WORKSPACES:START -->
 *   ... lines listing each workspace ...
 *   <!-- WORKSPACES:END -->
 *
 * A workspace counts as "listed" when its bare directory slug (e.g.
 * `ui-kit`, `web`), its full repo-relative path (e.g. `packages/ui-kit`,
 * `apps/web`), or its npm package name (`@pxlkit/ui-kit`) appears anywhere
 * inside the marker block.
 *
 * Any drift between the workspaces field and what the README documents is
 * reported as **major** — it's the second README touchpoint contributors
 * and AI agents check to understand "what lives where".
 */

import * as path from 'node:path';
import * as fs from 'fs-extra';
import { glob as fgGlob } from 'fast-glob';

import {
  Gate,
  gateFail,
  gateOk,
  type AuditContext,
  type GateFinding,
  type GateResult,
} from '../_lib/gate-base.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const WORKSPACES_START_MARKER = '<!-- WORKSPACES:START -->';
export const WORKSPACES_END_MARKER = '<!-- WORKSPACES:END -->';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RootPackageJsonLike {
  name?: string;
  workspaces?: string[] | { packages?: string[] };
}

interface WorkspacePackageJsonLike {
  name?: string;
}

export interface WorkspaceRef {
  /** npm package name (e.g. `@pxlkit/ui-kit`); empty when no package.json found. */
  packageName: string;
  /** Repo-relative POSIX path (e.g. `packages/ui-kit`, `apps/web`). */
  relDir: string;
  /** Bare directory slug (e.g. `ui-kit`, `web`). */
  slug: string;
}

export interface MonorepoMapReport {
  readmeFile: string;
  /** Both markers were located and the block was non-empty. */
  markersFound: boolean;
  /** Raw content between the markers (excluding the marker lines themselves). */
  blockContent: string;
  /** Every workspace expanded from the root package.json. */
  workspaces: WorkspaceRef[];
  /** Workspace dirs whose name/slug/path could not be found in the block. */
  missing: WorkspaceRef[];
  /**
   * Bare workspace-like tokens that appear inside the block but no longer
   * map to any real workspace on disk. Useful for catching renamed/removed
   * packages whose README row got forgotten.
   */
  orphanTokens: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

export function workspacePatterns(pkg: RootPackageJsonLike): string[] {
  if (!pkg.workspaces) return [];
  if (Array.isArray(pkg.workspaces)) return pkg.workspaces;
  if (Array.isArray(pkg.workspaces.packages)) return pkg.workspaces.packages;
  return [];
}

/**
 * Extracts the content between the START/END markers. Returns `null` when
 * either marker is missing or they appear in the wrong order.
 */
export function extractWorkspacesBlock(readme: string): string | null {
  const startIdx = readme.indexOf(WORKSPACES_START_MARKER);
  const endIdx = readme.indexOf(WORKSPACES_END_MARKER);
  if (startIdx < 0 || endIdx < 0) return null;
  if (endIdx < startIdx) return null;
  const sliceStart = startIdx + WORKSPACES_START_MARKER.length;
  return readme.slice(sliceStart, endIdx);
}

/**
 * Returns true when `block` mentions the workspace via its package name,
 * its repo-relative path, or its bare directory slug. The lookup is
 * case-insensitive for path/slug tokens but case-sensitive for the npm
 * package name (npm names are lowercase by spec, but we don't rewrite).
 */
export function blockMentionsWorkspace(
  block: string,
  ws: WorkspaceRef,
): boolean {
  const lowerBlock = block.toLowerCase();
  if (ws.packageName && block.includes(ws.packageName)) return true;
  if (ws.relDir && lowerBlock.includes(ws.relDir.toLowerCase())) return true;
  if (ws.slug) {
    // Bare-slug match must be a whole token: treat `-` as part of the token
    // so the slug `ui` doesn't match inside `ui-kit`. We require the slug to
    // be flanked by start-of-string, end-of-string, or a non-`[a-z0-9_-]`
    // character on each side.
    const slug = escapeRegex(ws.slug);
    const re = new RegExp(`(^|[^a-z0-9_-])${slug}(?![a-z0-9_-])`, 'i');
    if (re.test(block)) return true;
  }
  return false;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Best-effort scan of the block for tokens that *look* like a workspace
 * reference but don't match any real workspace. We only flag tokens that
 * are unambiguously workspace-shaped:
 *   - `@scope/name` package identifiers
 *   - `packages/...` or `apps/...` repo paths
 *
 * Anything else (prose, table headers, badges) is ignored.
 */
export function findOrphanTokens(
  block: string,
  workspaces: WorkspaceRef[],
): string[] {
  const knownNames = new Set(workspaces.map((w) => w.packageName).filter(Boolean));
  const knownPaths = new Set(workspaces.map((w) => w.relDir).filter(Boolean));

  const orphans = new Set<string>();

  const PKG_NAME_RE = /@[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9.-]*/gi;
  for (const m of block.matchAll(PKG_NAME_RE)) {
    const token = m[0];
    if (!knownNames.has(token)) orphans.add(token);
  }

  const PATH_RE = /(?:packages|apps)\/[a-z0-9][a-z0-9._-]*/gi;
  for (const m of block.matchAll(PATH_RE)) {
    const token = m[0].toLowerCase();
    let matched = false;
    for (const known of knownPaths) {
      if (known.toLowerCase() === token) {
        matched = true;
        break;
      }
    }
    if (!matched) orphans.add(token);
  }

  return [...orphans].sort();
}

// ---------------------------------------------------------------------------
// Workspace discovery
// ---------------------------------------------------------------------------

export async function discoverWorkspaceRefs(
  repoRoot: string,
  rootPkg: RootPackageJsonLike,
): Promise<WorkspaceRef[]> {
  const patterns = workspacePatterns(rootPkg);
  if (patterns.length === 0) return [];

  const dirs = await fgGlob(patterns, {
    cwd: repoRoot,
    onlyDirectories: true,
    absolute: true,
    suppressErrors: true,
    deep: 2,
  });

  const out: WorkspaceRef[] = [];
  for (const absDir of dirs) {
    const relDir = toPosix(path.relative(repoRoot, absDir));
    const slug = relDir.split('/').pop() ?? '';
    const pkgJsonPath = path.join(absDir, 'package.json');
    let packageName = '';
    if (await fs.pathExists(pkgJsonPath)) {
      try {
        const pkg = (await fs.readJson(pkgJsonPath)) as WorkspacePackageJsonLike;
        if (typeof pkg.name === 'string') packageName = pkg.name;
      } catch {
        // Ignore unparseable workspace package.json — we still surface the
        // path/slug from disk.
      }
    }
    out.push({ packageName, relDir, slug });
  }

  out.sort((a, b) => a.relDir.localeCompare(b.relDir));
  return out;
}

// ---------------------------------------------------------------------------
// Programmatic API
// ---------------------------------------------------------------------------

export interface AuditMonorepoMapOptions {
  /** Override the root README path; defaults to `<repoRoot>/README.md`. */
  readmeFile?: string;
}

export async function auditMonorepoMap(
  ctx: AuditContext,
  options: AuditMonorepoMapOptions = {},
): Promise<MonorepoMapReport> {
  const readmeFile = options.readmeFile ?? path.join(ctx.repoRoot, 'README.md');
  const rootPkgPath = path.join(ctx.repoRoot, 'package.json');

  let rootPkg: RootPackageJsonLike = {};
  if (await fs.pathExists(rootPkgPath)) {
    try {
      rootPkg = (await fs.readJson(rootPkgPath)) as RootPackageJsonLike;
    } catch (err) {
      ctx.logger.warn(
        `monorepo-map: failed to read root package.json: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  const workspaces = await discoverWorkspaceRefs(ctx.repoRoot, rootPkg);

  let readme = '';
  if (await fs.pathExists(readmeFile)) {
    readme = await fs.readFile(readmeFile, 'utf8');
  }

  const block = extractWorkspacesBlock(readme);
  const markersFound = block !== null;
  const blockContent = block ?? '';

  const missing: WorkspaceRef[] = markersFound
    ? workspaces.filter((ws) => !blockMentionsWorkspace(blockContent, ws))
    : [...workspaces];

  const orphanTokens = markersFound
    ? findOrphanTokens(blockContent, workspaces)
    : [];

  return {
    readmeFile,
    markersFound,
    blockContent,
    workspaces,
    missing,
    orphanTokens,
  };
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

export class MonorepoMapGate extends Gate {
  readonly id = 16;
  readonly name = 'monorepo-map';
  readonly description =
    'Root README.md monorepo map section (between <!-- WORKSPACES:START --> markers) must list every workspace from root package.json workspaces field. Major on mismatch.';

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    const report = await auditMonorepoMap(ctx);
    const relReadme = path.relative(ctx.repoRoot, report.readmeFile) || report.readmeFile;

    if (!report.markersFound) {
      findings.push({
        severity: 'major',
        file: relReadme,
        message: `Root README.md is missing the workspaces map markers (${WORKSPACES_START_MARKER} / ${WORKSPACES_END_MARKER}).`,
        suggestion: `Add a section delimited by ${WORKSPACES_START_MARKER} ... ${WORKSPACES_END_MARKER} that lists each workspace from the root package.json "workspaces" field.`,
      });
    } else {
      for (const ws of report.missing) {
        const label = ws.packageName || ws.relDir || ws.slug;
        findings.push({
          severity: 'major',
          file: relReadme,
          component: label,
          message: `Workspace "${label}" (${ws.relDir}) is declared in root package.json "workspaces" but absent from the README monorepo map block.`,
          suggestion: `Add a row for "${label}" between ${WORKSPACES_START_MARKER} and ${WORKSPACES_END_MARKER} in ${relReadme}.`,
        });
      }

      for (const token of report.orphanTokens) {
        findings.push({
          severity: 'major',
          file: relReadme,
          component: token,
          message: `README monorepo map references "${token}", but no such workspace exists under the root package.json "workspaces" globs.`,
          suggestion: `Either restore the workspace or remove the "${token}" row from the monorepo map block in ${relReadme}.`,
        });
      }
    }

    const duration_ms = Date.now() - started;
    ctx.logger.debug(
      `monorepo-map: ${report.workspaces.length} workspace(s), ${findings.length} finding(s) in ${duration_ms}ms`,
    );
    return findings.length === 0
      ? gateOk(this.name, duration_ms)
      : gateFail(this.name, findings, duration_ms);
  }
}

const gate = new MonorepoMapGate();
export default gate;
