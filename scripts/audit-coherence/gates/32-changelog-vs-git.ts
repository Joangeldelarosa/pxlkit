import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import type { DriftItem, Gate, GateResult } from '../types';

import { adaptFunctionalGate } from '../_lib/functional-gate-adapter.js';
import { parseReleaseSections } from '../_lib/release-policy.js';

const GATE_ID = '32-changelog-vs-git';
const DESCRIPTION =
  'Release-policy-aware changelog vs git: user-facing commits (feat/fix/perf/refactor/revert) touching packages/ui-kit source since the last ui-kit release must be covered by a bullet in the ui-kit CHANGELOG "## Unreleased" (or latest release) section; sha refs in the root CHANGELOG latest release must resolve to real commits.';

const CHANGELOG_PATH = 'CHANGELOG.md';
const UI_KIT_CHANGELOG_PATH = 'packages/ui-kit/CHANGELOG.md';

const execFileAsync = promisify(execFile);

/**
 * Matches a Keep-a-Changelog release heading like:
 *   ## [ui 1.2.5] - 2026-05-28 — UI pack refinement pass
 *   ## [1.0.0] - 2025-01-01
 *
 * Captures the version slug (e.g. "ui 1.2.5" or "1.0.0").
 */
const RELEASE_HEADING_REGEX = /^##\s+\[([^\]]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})/gm;

/**
 * Matches inline PR references like (#123) or commit shas like (abc1234)
 * inside a CHANGELOG bullet body.
 */
const PR_REF_REGEX = /\(#(\d+)\)/g;
const SHA_REF_REGEX = /\b([0-9a-f]{7,40})\b/g;

/**
 * Conventional-commit types that signal a release-policy-relevant change.
 * Per VERSIONING.md every feat/fix/perf maps to a semver bump, and this
 * repo's practice logs refactors of package source too (Ola 4d/4e are in
 * the changelog). test/chore/ci/docs/style/build commits ship without an
 * entry.
 */
const USER_FACING_PREFIX_REGEX = /^(feat|fix|perf|refactor|revert)(\([^)]+\))?!?:/i;

/**
 * Words too generic (or too conventional-commit-flavoured) to count as
 * evidence that a changelog bullet covers a commit.
 */
const STOPWORDS = new Set([
  'feat', 'fixes', 'fixed', 'perf', 'refactor', 'revert', 'chore', 'docs',
  'test', 'tests', 'style', 'build', 'release', 'breaking',
  'this', 'that', 'these', 'those', 'with', 'without', 'from', 'into', 'onto',
  'over', 'under', 'after', 'before', 'between', 'across', 'against',
  'they', 'their', 'them', 'then', 'than', 'when', 'where', 'which', 'while',
  'will', 'would', 'should', 'could', 'were', 'been', 'being', 'have', 'does',
  'done', 'doing', 'make', 'makes', 'made', 'making', 'instead',
  'only', 'also', 'just', 'very', 'more', 'most', 'much', 'many', 'some',
  'each', 'every', 'both', 'still', 'longer', 'every', 'rather',
  'what', 'how', 'why', 'who', 'whom', 'whose', 'because', 'since',
]);

export interface ParsedRelease {
  slug: string;
  date: string;
  body: string;
}

export interface GitCommit {
  sha: string;
  subject: string;
  /** Commit date, YYYY-MM-DD. Optional for legacy callers; missing = exempt from the ui-kit entry check. */
  date?: string;
  /** Commit body (change summary). Used only for component-name matching. */
  body?: string;
  /** Paths touched by the commit. Missing/empty = exempt from the ui-kit entry check. */
  files?: string[];
}

export interface GateInputs {
  /** Root CHANGELOG.md (icon-pack releases). */
  changelog: string | null;
  /** packages/ui-kit/CHANGELOG.md (release-policy source of truth for the kit). */
  uiKitChangelog: string | null;
  commitsSinceLastRelease: GitCommit[];
  gitAvailable: boolean;
}

interface RunOptions {
  /** Override git execution for tests. */
  runGit?: (args: string[], cwd: string) => Promise<string>;
}

/**
 * Pretty format used for `git log`: \x01 starts a record, then
 * sha<TAB>date<TAB>subject on the first line, the raw body until \x02,
 * and (because of --name-only) the touched paths until the next record.
 */
const GIT_LOG_FORMAT = '%x01%H%x09%ad%x09%s%n%b%x02';

async function tryRead(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

export function parseReleases(changelog: string): ParsedRelease[] {
  const releases: ParsedRelease[] = [];
  const matches = Array.from(changelog.matchAll(RELEASE_HEADING_REGEX));
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]!;
    const slug = m[1]!;
    const date = m[2]!;
    const start = m.index! + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1]!.index! : changelog.length;
    const body = changelog.slice(start, end);
    releases.push({ slug, date, body });
  }
  return releases;
}

export function extractRefs(body: string): { prs: string[]; shas: string[] } {
  const prs = Array.from(body.matchAll(PR_REF_REGEX)).map((m) => m[1]!);
  const shas = Array.from(body.matchAll(SHA_REF_REGEX)).map((m) => m[1]!);
  return { prs, shas };
}

export function isUserFacing(subject: string): boolean {
  return USER_FACING_PREFIX_REGEX.test(subject);
}

/**
 * A commit is in scope for the ui-kit changelog only when it touches kit
 * SOURCE: files under packages/ui-kit/ that are not tests, stories or
 * markdown. Commits that only touch scripts/, .github/, apps/web etc. are
 * tooling/site work and ship without a kit changelog entry.
 */
export function touchesUiKitSource(files: string[] | undefined): boolean {
  if (!files || files.length === 0) return false;
  return files.some((f) => {
    const p = f.replace(/\\/g, '/');
    if (!p.startsWith('packages/ui-kit/')) return false;
    if (p.includes('/__tests__/')) return false;
    if (/\.(test|spec|stories)\.[cm]?[jt]sx?$/.test(p)) return false;
    if (p.endsWith('.md')) return false;
    return true;
  });
}

/** CamelCase identifiers (PixelDropdown, FieldShell, PxlKitButton…). */
function identTokens(text: string): string[] {
  return Array.from(new Set(text.match(/\b[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+\b/g) ?? []));
}

/** Significant lowercase keywords from a commit subject (scope included, package-name scope excluded). */
function keywordTokens(subject: string): string[] {
  const scopeMatch = /^[a-z]+\(([^)]+)\)/i.exec(subject);
  const scope = scopeMatch?.[1]?.toLowerCase() ?? '';
  const words = subject.toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) ?? [];
  const tokens = new Set<string>();
  // The package's own name as scope carries no information for the
  // package's own changelog; other scopes (e.g. "coherence") do.
  if (scope && scope !== 'ui-kit' && scope !== 'uikit' && !STOPWORDS.has(scope)) {
    tokens.add(scope);
  }
  for (const w of words) {
    if (!STOPWORDS.has(w)) tokens.add(w);
  }
  return Array.from(tokens);
}

/** Fold wrapped markdown bullets into single strings. */
export function foldBullets(text: string): string[] {
  const bullets: string[] = [];
  let current: string | null = null;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*[-*]\s+/.test(line)) {
      if (current) bullets.push(current);
      current = line.trim();
      continue;
    }
    if (/^#{2,}\s/.test(line) || line.trim() === '') {
      if (current) bullets.push(current);
      current = null;
      continue;
    }
    if (current) current += ' ' + line.trim();
  }
  if (current) bullets.push(current);
  return bullets;
}

/**
 * Does any bullet in the coverage pool "count" as the changelog entry for
 * this commit? Per the release policy a wave of commits may be summarized
 * by one bullet, so this is deliberately NOT a 1:1 subject match:
 *
 *   1. the pool references the commit sha (7+ chars) or a PR ref from the
 *      subject, or
 *   2. a bullet shares a component/identifier name (CamelCase token) with
 *      the commit subject OR body (the "change summary"), or
 *   3. a single bullet shares >= 2 significant keywords with the subject
 *      (scope keywords count; stopwords and the package's own name don't).
 */
export function isCommitCovered(commit: GitCommit, bullets: string[], poolText: string): boolean {
  const poolLc = poolText.toLowerCase();

  const sha7 = commit.sha.slice(0, 7).toLowerCase();
  if (sha7 && poolLc.includes(sha7)) return true;

  const prRefs = commit.subject.match(/#\d+/g) ?? [];
  if (prRefs.some((ref) => poolText.includes(ref))) return true;

  const idents = identTokens(`${commit.subject}\n${commit.body ?? ''}`);
  if (idents.length > 0 && bullets.some((b) => idents.some((t) => b.includes(t)))) {
    return true;
  }

  const keywords = keywordTokens(commit.subject);
  if (keywords.length >= 2) {
    for (const bullet of bullets) {
      const bulletLc = bullet.toLowerCase();
      let hits = 0;
      for (const kw of keywords) {
        if (bulletLc.includes(kw)) hits++;
        if (hits >= 2) return true;
      }
    }
  }

  return false;
}

async function defaultRunGit(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync('git', args, { cwd, maxBuffer: 10 * 1024 * 1024 });
  return stdout;
}

/** Parse the \x01/\x02-delimited `git log --name-only` output. */
export function parseGitLog(raw: string): GitCommit[] {
  const commits: GitCommit[] = [];
  for (const record of raw.split('\x01')) {
    if (!record.trim()) continue;
    const [headerAndBody, filesPart = ''] = record.split('\x02');
    const lines = headerAndBody!.split('\n');
    const header = lines[0] ?? '';
    const [sha, date, ...rest] = header.split('\t');
    if (!sha) continue;
    const body = lines.slice(1).join('\n').trim();
    const files = filesPart
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    commits.push({ sha, date, subject: rest.join('\t'), body, files });
  }
  return commits;
}

export async function loadInputs(
  repoRoot: string,
  opts: RunOptions = {},
): Promise<GateInputs> {
  const runGit = opts.runGit ?? defaultRunGit;
  const changelog = await tryRead(join(repoRoot, CHANGELOG_PATH));
  const uiKitChangelog = await tryRead(join(repoRoot, UI_KIT_CHANGELOG_PATH));

  let gitAvailable = true;
  let commitsSinceLastRelease: GitCommit[] = [];

  if (changelog || uiKitChangelog) {
    // Boundary: the OLDER of the two latest release dates, so the commit
    // pool serves both the root sha-ref check and the ui-kit entry check.
    const dates: string[] = [];
    if (changelog) {
      const latest = parseReleases(changelog)[0];
      if (latest) dates.push(latest.date);
    }
    if (uiKitChangelog) {
      const latest = parseReleaseSections(uiKitChangelog).find(
        (s) => !s.unreleased && s.version && s.date,
      );
      if (latest?.date) dates.push(latest.date);
    }
    try {
      const sinceArg = dates.length > 0 ? `--since=${dates.sort()[0]}` : '--max-count=200';
      const raw = await runGit(
        ['log', sinceArg, '--no-merges', '--date=short', '--name-only', `--pretty=format:${GIT_LOG_FORMAT}`],
        repoRoot,
      );
      commitsSinceLastRelease = parseGitLog(raw);
    } catch {
      gitAvailable = false;
    }
  }

  return { changelog, uiKitChangelog, commitsSinceLastRelease, gitAvailable };
}

export function evaluate(inputs: GateInputs): DriftItem[] {
  const drift: DriftItem[] = [];
  const { changelog, uiKitChangelog, commitsSinceLastRelease, gitAvailable } = inputs;

  if (!changelog) {
    drift.push({
      artifact: CHANGELOG_PATH,
      expected: 'CHANGELOG.md exists at repo root with at least one release heading',
      actual: 'CHANGELOG.md not found',
      severity: 'major',
    });
    return drift;
  }

  const releases = parseReleases(changelog);
  if (releases.length === 0) {
    drift.push({
      artifact: CHANGELOG_PATH,
      expected: 'At least one "## [version] - YYYY-MM-DD" release heading',
      actual: 'No Keep-a-Changelog release heading parsed',
      severity: 'major',
    });
    return drift;
  }

  if (!gitAvailable) {
    drift.push({
      artifact: CHANGELOG_PATH,
      expected: 'git log readable so the gate can correlate commits with CHANGELOG entries',
      actual: 'git log failed — cannot verify changelog vs git coherence',
      severity: 'minor',
    });
    return drift;
  }

  // (a) Release-policy check: user-facing commits that touch ui-kit source
  // since the latest ui-kit release must be covered by the accumulating
  // "## Unreleased" section (or the latest release section) of the ui-kit
  // changelog. Commits dated the same day as the release are presumed
  // rolled into it.
  if (uiKitChangelog) {
    const sections = parseReleaseSections(uiKitChangelog);
    const latestRelease = sections.find((s) => !s.unreleased && s.version && s.date);
    if (latestRelease) {
      const pool = [...sections.filter((s) => s.unreleased), latestRelease];
      const poolText = pool.map((s) => s.body).join('\n');
      const bullets = pool.flatMap((s) => foldBullets(s.body));
      for (const c of commitsSinceLastRelease) {
        if (!isUserFacing(c.subject)) continue;
        if (!c.date || c.date <= latestRelease.date!) continue;
        if (!touchesUiKitSource(c.files)) continue;
        if (isCommitCovered(c, bullets, poolText)) continue;
        drift.push({
          artifact: UI_KIT_CHANGELOG_PATH,
          expected: `An "## Unreleased" bullet covering commit ${c.sha.slice(0, 7)} — "${c.subject}"`,
          actual:
            'User-facing commit touches packages/ui-kit source but no Unreleased/latest-release bullet matches it (by sha, PR ref, component name, or keyword overlap)',
          severity: 'major',
        });
      }
    }
  }

  // (b) Every PR / sha referenced in the CHANGELOG must correspond to a real
  // commit. PRs cannot be cheaply validated without GitHub, so we only check
  // sha references against the recent log. (Older releases are not regressed
  // — we only check refs in the latest release body to keep the gate fast.)
  const latest = releases[0]!;
  const { shas } = extractRefs(latest.body);
  const knownShas = new Set(commitsSinceLastRelease.map((c) => c.sha.toLowerCase()));
  for (const ref of shas) {
    const refLc = ref.toLowerCase();
    const matched = Array.from(knownShas).some((sha) => sha.startsWith(refLc));
    if (!matched) {
      drift.push({
        artifact: CHANGELOG_PATH,
        expected: `Referenced sha ${ref} resolves to a commit reachable from HEAD`,
        actual: `Sha ${ref} not found in git log since ${latest.date}`,
        severity: 'major',
      });
    }
  }

  return drift;
}

export const changelogVsGitGate: Gate = async ({ repoRoot }): Promise<GateResult> => {
  const inputs = await loadInputs(repoRoot);
  const drift = evaluate(inputs);
  return { gateId: GATE_ID, description: DESCRIPTION, drift };
};

// Orchestrator-compatible wrapper; the named functional export above is
// the pure core the unit tests exercise directly.
export default adaptFunctionalGate({
  id: 32,
  name: 'changelog-vs-git',
  description: DESCRIPTION,
  fn: changelogVsGitGate,
});
