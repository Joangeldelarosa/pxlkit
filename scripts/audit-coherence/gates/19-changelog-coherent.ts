/**
 * Gate 19 — changelog-coherent.
 *
 * Sanity contract:
 *   Every `## X.Y.Z` entry inside a package's CHANGELOG.md must reference at
 *   least one commit SHA that actually exists in `git log`. An entry that
 *   names no SHA (or names only SHAs git can't resolve) is "orphan" — the
 *   release notes claim a release happened but there is no commit trail
 *   anyone reading the repo can follow back from. Orphan entries are
 *   surfaced as `minor` findings (not blockers): they don't break a build,
 *   but they erode trust in the changelog as historical source of truth.
 *
 *   Entries below the top heading whose version equals package.json.version
 *   AND which is still on HEAD (i.e. the in-flight release) are tolerated:
 *   the commit that ships them may not exist yet. The gate annotates such
 *   tolerated entries as `info` instead of `minor`.
 *
 * What counts as a "commit reference"?
 *   - Bare SHA tokens (7..40 hex chars) inside the section body.
 *   - Markdown links / footnote refs whose href contains
 *     `/commit/<sha>` or `commit=<sha>` (GitHub-style).
 *   - `(<sha>)`, `[<sha>]`, or trailing `— <sha>` shorthand.
 *
 * Resolution strategy:
 *   - We snapshot every commit SHA reachable from HEAD into a Set (full
 *     40-char). We also keep a prefix-index so 7-char shorts resolve in
 *     O(1) average.
 *   - If git is unavailable (e.g. unpacked tarball CI) the gate degrades
 *     to `info` rather than failing — we don't want to wedge releases when
 *     the .git directory is missing.
 */

import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
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
// Section parsing
// ---------------------------------------------------------------------------

/**
 * Matches a CHANGELOG section heading like `## 1.2.3`, `## v1.2.3 — note`,
 * `## [1.2.3]`. Capture group 1 = bare semver, group 2 = the rest of the line.
 */
const CHANGELOG_SECTION_HEADING_RE =
  /^##\s+\[?v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\]?(.*)$/gm;

export interface ChangelogSection {
  version: string;
  /** Raw text after the version on the heading line (trimmed). */
  headingExtra: string;
  /** Body between this heading and the next `## ` heading. Trailing whitespace stripped. */
  body: string;
  /** 1-based line number of the heading. */
  line: number;
}

function lineOfIndex(source: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < source.length; i += 1) {
    if (source.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

export function parseChangelogSections(source: string): ChangelogSection[] {
  const out: ChangelogSection[] = [];
  CHANGELOG_SECTION_HEADING_RE.lastIndex = 0;
  const matches: Array<{
    version: string;
    headingExtra: string;
    headingStart: number;
    headingEnd: number;
    line: number;
  }> = [];
  let m: RegExpExecArray | null;
  while ((m = CHANGELOG_SECTION_HEADING_RE.exec(source)) !== null) {
    matches.push({
      version: m[1] ?? '',
      headingExtra: (m[2] ?? '').trim(),
      headingStart: m.index,
      headingEnd: m.index + m[0].length,
      line: lineOfIndex(source, m.index),
    });
  }
  for (let i = 0; i < matches.length; i += 1) {
    const cur = matches[i]!;
    const next = matches[i + 1];
    const bodyEnd = next ? next.headingStart : source.length;
    const body = source.slice(cur.headingEnd, bodyEnd).replace(/\s+$/g, '');
    out.push({
      version: cur.version,
      headingExtra: cur.headingExtra,
      body,
      line: cur.line,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Commit-reference extraction
// ---------------------------------------------------------------------------

/**
 * Find anything that could plausibly be a commit SHA: 7..40 lowercase hex
 * not embedded in a longer alphanumeric run. We deliberately allow up to
 * 40 chars (full SHA) and refuse anything matching all-decimal (so we
 * don't pull years like 2026 or version "1234567").
 */
const SHA_TOKEN_RE = /(?<![0-9a-f])([0-9a-f]{7,40})(?![0-9a-f])/gi;

export function extractCommitShasFromSection(body: string): string[] {
  const found = new Set<string>();
  SHA_TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SHA_TOKEN_RE.exec(body)) !== null) {
    const tok = (m[1] ?? '').toLowerCase();
    if (tok.length < 7) continue;
    if (/^\d+$/.test(tok)) continue; // all-digit "shas" are almost certainly numbers
    found.add(tok);
  }
  return Array.from(found);
}

// ---------------------------------------------------------------------------
// Git introspection
// ---------------------------------------------------------------------------

export interface CommitIndex {
  /** All full 40-char SHAs reachable from HEAD. */
  full: Set<string>;
  /** Map of short-prefix (>=7 chars) → list of full SHAs sharing that prefix. */
  byPrefix: Map<string, string[]>;
  /** True if git was reachable and produced output. */
  available: boolean;
  /** Why git was unavailable, if applicable. */
  unavailableReason?: string;
}

export interface GitRunner {
  run(args: string[], cwd: string): { ok: boolean; stdout: string; stderr: string };
}

export const defaultGitRunner: GitRunner = {
  run(args, cwd) {
    try {
      const res = spawnSync('git', args, {
        cwd,
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        windowsHide: true,
      });
      if (res.error) {
        return { ok: false, stdout: '', stderr: String(res.error.message ?? res.error) };
      }
      const stdout = typeof res.stdout === 'string' ? res.stdout : '';
      const stderr = typeof res.stderr === 'string' ? res.stderr : '';
      return { ok: res.status === 0, stdout, stderr };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, stdout: '', stderr: message };
    }
  },
};

export function buildCommitIndex(
  repoRoot: string,
  runner: GitRunner = defaultGitRunner,
): CommitIndex {
  const insideRes = runner.run(['rev-parse', '--is-inside-work-tree'], repoRoot);
  if (!insideRes.ok || insideRes.stdout.trim() !== 'true') {
    return {
      full: new Set(),
      byPrefix: new Map(),
      available: false,
      unavailableReason:
        insideRes.stderr.trim() || 'git rev-parse refused — not a working tree',
    };
  }

  const logRes = runner.run(['log', '--all', '--format=%H'], repoRoot);
  if (!logRes.ok) {
    return {
      full: new Set(),
      byPrefix: new Map(),
      available: false,
      unavailableReason: logRes.stderr.trim() || 'git log failed',
    };
  }

  const full = new Set<string>();
  const byPrefix = new Map<string, string[]>();
  for (const raw of logRes.stdout.split(/\r?\n/)) {
    const sha = raw.trim().toLowerCase();
    if (sha.length !== 40 || !/^[0-9a-f]{40}$/.test(sha)) continue;
    full.add(sha);
    // Index prefixes from length 7 up to full length so any short ref resolves.
    for (let len = 7; len <= 40; len += 1) {
      const pfx = sha.slice(0, len);
      const bucket = byPrefix.get(pfx);
      if (bucket) bucket.push(sha);
      else byPrefix.set(pfx, [sha]);
    }
  }

  return { full, byPrefix, available: true };
}

export function resolveSha(ref: string, idx: CommitIndex): 'unique' | 'ambiguous' | 'missing' {
  const r = ref.toLowerCase();
  if (r.length === 40) return idx.full.has(r) ? 'unique' : 'missing';
  const bucket = idx.byPrefix.get(r);
  if (!bucket || bucket.length === 0) return 'missing';
  if (bucket.length > 1) return 'ambiguous';
  return 'unique';
}

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

interface PackageJsonShape {
  name?: string;
  version?: string;
}

export interface ChangelogCoherentOptions {
  /** Inject a custom git runner — used by tests to mock spawnSync. */
  gitRunner?: GitRunner;
  /** Inject a pre-built index instead of running git. */
  commitIndex?: CommitIndex;
}

export class ChangelogCoherentGate extends Gate {
  readonly id = 19;
  readonly name = 'changelog-coherent';
  readonly description =
    "Every CHANGELOG.md entry must reference at least one commit that exists in git log. Minor on orphan entries; the in-flight release (top entry matching package.json.version) is tolerated as info if it carries no SHA yet.";

  private readonly options: ChangelogCoherentOptions;

  constructor(options: ChangelogCoherentOptions = {}) {
    super();
    this.options = options;
  }

  async run(ctx: AuditContext): Promise<GateResult> {
    const started = Date.now();
    const findings: GateFinding[] = [];

    if (ctx.changelogFiles.length === 0) {
      return {
        name: this.name,
        passed: true,
        duration_ms: Date.now() - started,
        findings: [
          {
            severity: 'info',
            message: 'no CHANGELOG.md files discovered — nothing to verify',
          },
        ],
      };
    }

    const idx =
      this.options.commitIndex ??
      buildCommitIndex(ctx.repoRoot, this.options.gitRunner ?? defaultGitRunner);

    if (!idx.available) {
      // Degrade to info — don't wedge CI when running outside a git work tree.
      return {
        name: this.name,
        passed: true,
        duration_ms: Date.now() - started,
        findings: [
          {
            severity: 'info',
            message: `git unavailable (${idx.unavailableReason ?? 'unknown reason'}) — changelog-coherent skipped`,
            suggestion: 'Run the audit from within the git work tree to verify SHA references.',
          },
        ],
      };
    }

    for (const ref of ctx.changelogFiles) {
      const pkgFindings = await this.checkPackageChangelog(ctx, ref, idx);
      findings.push(...pkgFindings);
    }

    if (findings.length === 0) {
      return gateOk(this.name, Date.now() - started);
    }
    return gateFail(this.name, findings, Date.now() - started);
  }

  private async checkPackageChangelog(
    ctx: AuditContext,
    ref: { package: string; path: string },
    idx: CommitIndex,
  ): Promise<GateFinding[]> {
    const findings: GateFinding[] = [];

    let content: string;
    try {
      content = await fs.readFile(ref.path, 'utf8');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      findings.push({
        severity: 'major',
        file: ref.path,
        component: ref.package,
        message: `failed to read CHANGELOG.md: ${message}`,
        suggestion: 'ensure the CHANGELOG.md file is readable and UTF-8 encoded',
      });
      return findings;
    }

    const sections = parseChangelogSections(content);
    if (sections.length === 0) {
      findings.push({
        severity: 'minor',
        file: ref.path,
        component: ref.package,
        message: 'CHANGELOG.md has no `## X.Y.Z` sections to check',
        suggestion: 'add a versioned entry like "## 1.0.0 — YYYY-MM-DD" with bullet points',
      });
      return findings;
    }

    // Look up package.json.version so we can identify the in-flight release.
    let topVersion: string | null = null;
    const pkgJsonRef = ctx.packageJsons.find((p) => p.package === ref.package);
    if (pkgJsonRef) {
      try {
        const pj = (await fs.readJson(pkgJsonRef.path)) as PackageJsonShape;
        topVersion = typeof pj.version === 'string' ? pj.version : null;
      } catch {
        topVersion = null;
      }
    }

    const orphanReports: Array<{ section: ChangelogSection; reason: string }> = [];
    for (const section of sections) {
      const shas = extractCommitShasFromSection(section.body);
      if (shas.length === 0) {
        orphanReports.push({ section, reason: 'no commit SHA referenced in section body' });
        continue;
      }
      let anyResolved = false;
      const missing: string[] = [];
      const ambiguous: string[] = [];
      for (const sha of shas) {
        const status = resolveSha(sha, idx);
        if (status === 'unique') {
          anyResolved = true;
        } else if (status === 'ambiguous') {
          ambiguous.push(sha);
        } else {
          missing.push(sha);
        }
      }
      if (!anyResolved) {
        const parts: string[] = [];
        if (missing.length > 0) parts.push(`unknown SHAs: ${missing.join(', ')}`);
        if (ambiguous.length > 0) parts.push(`ambiguous SHAs: ${ambiguous.join(', ')}`);
        const reason =
          parts.length > 0
            ? parts.join('; ')
            : 'referenced SHAs did not resolve against git log';
        orphanReports.push({ section, reason });
      }
    }

    for (const report of orphanReports) {
      const isInFlightTop =
        topVersion !== null &&
        sections.length > 0 &&
        sections[0]!.version === report.section.version &&
        report.section.version === topVersion;
      const severity = isInFlightTop ? 'info' : 'minor';
      const where = `${path.relative(ctx.repoRoot, ref.path) || ref.path}:${report.section.line}`;
      findings.push({
        severity,
        file: ref.path,
        component: ref.package,
        message: `orphan changelog entry "## ${report.section.version}" at ${where} — ${report.reason}`,
        suggestion: isInFlightTop
          ? `This is the in-flight release matching package.json (${topVersion}). Stamp it with the release commit SHA before shipping (e.g. append "(<sha>)" to the heading or to each bullet).`
          : `Add at least one commit SHA reference to the "${report.section.version}" section (7+ hex chars, e.g. "(${[...idx.full][0]?.slice(0, 7) ?? 'abcdef0'})") so readers can trace the release back to git history.`,
      });
    }

    return findings;
  }
}

const gate = new ChangelogCoherentGate();
export default gate;

// ---------------------------------------------------------------------------
// CLI wrapper — `tsx scripts/audit-coherence/gates/19-changelog-coherent.ts`
// Supports `--json` for CI consumption. Exit 0 on pass, 1 on fail.
// ---------------------------------------------------------------------------

function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    const url = new URL(`file://${entry.replace(/\\/g, '/')}`).href;
    return import.meta.url === url || import.meta.url.endsWith(path.basename(entry));
  } catch {
    return false;
  }
}

async function cli(): Promise<void> {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const verbose = args.includes('--verbose');
  const repoArgIdx = args.findIndex((a) => a === '--repo');
  const repoRoot =
    repoArgIdx >= 0 && args[repoArgIdx + 1]
      ? path.resolve(args[repoArgIdx + 1]!)
      : path.resolve(process.cwd());

  const { loadAuditContext, createLogger } = await import('../_lib/load-context.js');
  const logger = createLogger(verbose);
  const ctx = await loadAuditContext(repoRoot, { logger });
  const result = await gate.run(ctx);

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const status = result.passed ? 'PASS' : 'FAIL';
    process.stdout.write(
      `[gate ${gate.id} ${gate.name}] ${status} (${result.duration_ms}ms) — ${result.findings.length} finding(s)\n`,
    );
    for (const f of result.findings) {
      const where = f.file ? ` ${f.file}` : '';
      const who = f.component ? ` [${f.component}]` : '';
      process.stdout.write(`  - ${f.severity}${who}${where}: ${f.message}\n`);
      if (f.suggestion) {
        process.stdout.write(`      ↳ ${f.suggestion}\n`);
      }
    }
  }

  process.exit(result.passed ? 0 : 1);
}

if (isMainModule()) {
  cli().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`fatal: ${message}\n`);
    process.exit(1);
  });
}
