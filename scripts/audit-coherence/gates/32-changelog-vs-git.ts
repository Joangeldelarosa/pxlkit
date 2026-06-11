import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import type { DriftItem, Gate, GateResult } from '../types';

import { adaptFunctionalGate } from '../_lib/functional-gate-adapter.js';

const GATE_ID = '32-changelog-vs-git';
const DESCRIPTION =
  'Every commit since the last release tag in CHANGELOG.md must be reflected as an entry, and every CHANGELOG entry must reference a commit/PR that exists in git history.';

const CHANGELOG_PATH = 'CHANGELOG.md';

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
 * Commit subjects that signal a user-facing change and should produce a
 * CHANGELOG entry. Anything else (chore/docs/test/refactor/ci) is allowed
 * to ship without an entry.
 */
const USER_FACING_PREFIX_REGEX = /^(feat|fix|perf|breaking|revert)(\([^)]+\))?!?:/i;

export interface ParsedRelease {
  slug: string;
  date: string;
  body: string;
}

export interface GitCommit {
  sha: string;
  subject: string;
}

export interface GateInputs {
  changelog: string | null;
  commitsSinceLastRelease: GitCommit[];
  gitAvailable: boolean;
}

interface RunOptions {
  /** Override git execution for tests. */
  runGit?: (args: string[], cwd: string) => Promise<string>;
}

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

async function defaultRunGit(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync('git', args, { cwd, maxBuffer: 10 * 1024 * 1024 });
  return stdout;
}

export async function loadInputs(
  repoRoot: string,
  opts: RunOptions = {},
): Promise<GateInputs> {
  const runGit = opts.runGit ?? defaultRunGit;
  const changelog = await tryRead(join(repoRoot, CHANGELOG_PATH));

  let gitAvailable = true;
  let commitsSinceLastRelease: GitCommit[] = [];

  if (changelog) {
    const releases = parseReleases(changelog);
    const latest = releases[0];
    try {
      // Use the latest release date as the boundary. Listing commits after
      // that date avoids needing a real git tag (CHANGELOG entries may not
      // have a corresponding tag for monorepo sub-packages).
      const sinceArg = latest ? `--since=${latest.date}` : '--max-count=200';
      const raw = await runGit(
        ['log', sinceArg, '--no-merges', '--pretty=format:%H%x09%s'],
        repoRoot,
      );
      commitsSinceLastRelease = raw
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [sha, ...rest] = line.split('\t');
          return { sha: sha!, subject: rest.join('\t') };
        });
    } catch {
      gitAvailable = false;
    }
  }

  return { changelog, commitsSinceLastRelease, gitAvailable };
}

export function evaluate(inputs: GateInputs): DriftItem[] {
  const drift: DriftItem[] = [];
  const { changelog, commitsSinceLastRelease, gitAvailable } = inputs;

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

  // (a) Every user-facing commit since the latest release should be reflected
  // in the CHANGELOG body (either by subject text or by sha/PR reference).
  const latest = releases[0]!;
  const latestBody = latest.body.toLowerCase();
  const userFacingMissing: GitCommit[] = [];
  for (const c of commitsSinceLastRelease) {
    if (!isUserFacing(c.subject)) continue;
    const subjectMentioned =
      latestBody.includes(c.subject.toLowerCase()) ||
      latestBody.includes(c.sha.slice(0, 7));
    if (!subjectMentioned) userFacingMissing.push(c);
  }
  for (const c of userFacingMissing) {
    drift.push({
      artifact: CHANGELOG_PATH,
      expected: `CHANGELOG entry for commit ${c.sha.slice(0, 7)} — "${c.subject}"`,
      actual: 'Commit subject and sha not referenced in the most recent release section',
      severity: 'major',
    });
  }

  // (b) Every PR / sha referenced in the CHANGELOG must correspond to a real
  // commit. PRs cannot be cheaply validated without GitHub, so we only check
  // sha references against the recent log. (Older releases are not regressed
  // — we only check refs in the latest release body to keep the gate fast.)
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
