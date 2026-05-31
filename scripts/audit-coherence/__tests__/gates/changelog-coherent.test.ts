/**
 * Tests for Gate 19 — changelog-coherent.
 *
 * Strategy: spin up a tmp repo-shaped tree, mint CHANGELOG.md + package.json,
 * and feed the gate a mocked GitRunner so we never need a real .git directory.
 */

import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { AuditContext } from '../../_lib/load-context.js';
import gate, {
  ChangelogCoherentGate,
  buildCommitIndex,
  extractCommitShasFromSection,
  parseChangelogSections,
  resolveSha,
  type CommitIndex,
  type GitRunner,
} from '../../gates/19-changelog-coherent.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'gate19-'));
});

afterEach(async () => {
  await fs.remove(tmpRoot);
});

interface MakePackageOpts {
  name: string;
  version: string;
  changelog: string | null; // null = don't write a CHANGELOG
}

async function makePackage(opts: MakePackageOpts): Promise<{
  packageDir: string;
  packageJsonPath: string;
  changelogPath: string | null;
}> {
  const pkgDir = path.join(tmpRoot, 'packages', opts.name.replace(/^@.*\//, ''));
  await fs.ensureDir(pkgDir);
  const packageJsonPath = path.join(pkgDir, 'package.json');
  await fs.writeJson(packageJsonPath, { name: opts.name, version: opts.version });

  let changelogPath: string | null = null;
  if (opts.changelog !== null) {
    changelogPath = path.join(pkgDir, 'CHANGELOG.md');
    await fs.writeFile(changelogPath, opts.changelog, 'utf8');
  }

  return { packageDir: pkgDir, packageJsonPath, changelogPath };
}

function mockCtx(parts: {
  packageJsons: Array<{ package: string; path: string }>;
  changelogFiles: Array<{ package: string; path: string }>;
}): AuditContext {
  return {
    repoRoot: tmpRoot,
    manifests: [],
    uiKitSrcDir: path.join(tmpRoot, 'packages/ui-kit/src'),
    appsWebSrcDir: path.join(tmpRoot, 'apps/web/src'),
    tokensFile: path.join(tmpRoot, 'packages/ui-kit/src/tokens.ts'),
    registryFile: path.join(tmpRoot, 'packages/ui-kit/src/registry.ts'),
    readmeFiles: [],
    changelogFiles: parts.changelogFiles,
    packageJsons: parts.packageJsons,
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
  };
}

/**
 * Mock git runner whose `git log --all --format=%H` returns the provided
 * SHAs (one per line). `rev-parse --is-inside-work-tree` returns true.
 */
function mockGitRunner(shas: string[]): GitRunner {
  return {
    run(args) {
      if (args[0] === 'rev-parse') {
        return { ok: true, stdout: 'true\n', stderr: '' };
      }
      if (args[0] === 'log') {
        return { ok: true, stdout: `${shas.join('\n')}\n`, stderr: '' };
      }
      return { ok: false, stdout: '', stderr: `unexpected args: ${args.join(' ')}` };
    },
  };
}

/** Mock git runner that simulates "not a git work tree". */
function brokenGitRunner(): GitRunner {
  return {
    run() {
      return { ok: false, stdout: '', stderr: 'fatal: not a git repository' };
    },
  };
}

const SHA_A = 'abcdef0123456789abcdef0123456789abcdef01';
// SHA_B intentionally starts with an alphanumeric mix so .slice(0,7) is not all-digit.
const SHA_B = '12a4567890abcdef1234567890abcdef12345678';
const SHA_C = 'fedcba9876543210fedcba9876543210fedcba98';

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe('parseChangelogSections', () => {
  it('splits the file by ## headings, captures version + body + line', () => {
    const body = [
      '# Changelog',
      '',
      '## 1.2.0 — 2026-05-30',
      '- thing one (abcdef0)',
      '',
      '## 1.1.0 — 2026-04-01',
      '- thing zero',
      '',
    ].join('\n');
    const sections = parseChangelogSections(body);
    expect(sections.map((s) => s.version)).toEqual(['1.2.0', '1.1.0']);
    expect(sections[0]!.body).toContain('thing one');
    expect(sections[0]!.line).toBe(3);
    expect(sections[1]!.line).toBe(6);
  });

  it('tolerates "## [v1.0.0]" and "## v1.0.0" shapes', () => {
    const body = '## [v1.0.0] — initial\n\n- bullet\n\n## v0.9.0\n- old\n';
    const sections = parseChangelogSections(body);
    expect(sections.map((s) => s.version)).toEqual(['1.0.0', '0.9.0']);
  });

  it('returns empty array when no headings match', () => {
    expect(parseChangelogSections('# top\n\nno releases yet\n')).toEqual([]);
  });
});

describe('extractCommitShasFromSection', () => {
  it('picks short and full SHAs out of a section body', () => {
    const body = [
      '- thing one (abcdef0)',
      '- thing two — see [commit](https://github.com/x/y/commit/1234567890abcdef1234567890abcdef12345678)',
      '- footer fedcba98',
    ].join('\n');
    const shas = extractCommitShasFromSection(body);
    expect(shas).toEqual(
      expect.arrayContaining(['abcdef0', '1234567890abcdef1234567890abcdef12345678', 'fedcba98']),
    );
  });

  it('rejects all-decimal tokens (years, numbers)', () => {
    const body = '- shipped in 2026, build 1234567 — no SHA here\n';
    const shas = extractCommitShasFromSection(body);
    expect(shas).toEqual([]);
  });

  it('returns empty for a section with no plausible SHA', () => {
    const body = '- added the thing\n- removed the other thing\n';
    expect(extractCommitShasFromSection(body)).toEqual([]);
  });

  it('does not pull SHAs embedded inside longer hex blobs', () => {
    // 50 hex chars — not a SHA. Ensure the boundary guard rejects substrings of it.
    const blob = '0123456789abcdef0123456789abcdef0123456789abcdef01';
    const body = `- digest: ${blob}\n`;
    expect(extractCommitShasFromSection(body)).toEqual([]);
  });
});

describe('buildCommitIndex + resolveSha', () => {
  it('builds the index from a mock git runner and resolves shorts', () => {
    const idx = buildCommitIndex(tmpRoot, mockGitRunner([SHA_A, SHA_B]));
    expect(idx.available).toBe(true);
    expect(idx.full.size).toBe(2);
    expect(resolveSha(SHA_A, idx)).toBe('unique');
    expect(resolveSha(SHA_A.slice(0, 7), idx)).toBe('unique');
    expect(resolveSha('deadbee', idx)).toBe('missing');
  });

  it('reports the index as unavailable when git fails', () => {
    const idx = buildCommitIndex(tmpRoot, brokenGitRunner());
    expect(idx.available).toBe(false);
    expect(idx.unavailableReason).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Gate.run end-to-end
// ---------------------------------------------------------------------------

describe('ChangelogCoherentGate.run', () => {
  it('passes when every entry references a known commit', async () => {
    const changelog = [
      '# Changelog',
      '',
      `## 1.2.0 — 2026-05-30 (${SHA_A.slice(0, 7)})`,
      `- shipped (${SHA_A.slice(0, 7)})`,
      '',
      `## 1.1.0 — 2026-04-01`,
      `- prior — see ${SHA_B}`,
      '',
    ].join('\n');
    const { packageJsonPath, changelogPath } = await makePackage({
      name: '@pxlkit/ui-kit',
      version: '1.2.0',
      changelog,
    });
    const ctx = mockCtx({
      packageJsons: [{ package: '@pxlkit/ui-kit', path: packageJsonPath }],
      changelogFiles: [{ package: '@pxlkit/ui-kit', path: changelogPath! }],
    });

    const g = new ChangelogCoherentGate({ gitRunner: mockGitRunner([SHA_A, SHA_B, SHA_C]) });
    const r = await g.run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
    expect(r.name).toBe('changelog-coherent');
    expect(typeof r.duration_ms).toBe('number');
  });

  it('flags orphan historical entries as minor', async () => {
    const changelog = [
      '# Changelog',
      '',
      `## 1.2.0 — 2026-05-30 (${SHA_A.slice(0, 7)})`,
      `- shipped (${SHA_A.slice(0, 7)})`,
      '',
      `## 1.1.0 — 2026-04-01`,
      `- prior with no SHA reference`,
      '',
    ].join('\n');
    const { packageJsonPath, changelogPath } = await makePackage({
      name: '@pxlkit/ui-kit',
      version: '1.2.0',
      changelog,
    });
    const ctx = mockCtx({
      packageJsons: [{ package: '@pxlkit/ui-kit', path: packageJsonPath }],
      changelogFiles: [{ package: '@pxlkit/ui-kit', path: changelogPath! }],
    });

    const g = new ChangelogCoherentGate({ gitRunner: mockGitRunner([SHA_A, SHA_B, SHA_C]) });
    const r = await g.run(ctx);
    // Minor findings shouldn't block.
    expect(r.passed).toBe(true);
    const orphan = r.findings.find(
      (f) =>
        f.severity === 'minor' &&
        f.message.includes('orphan changelog entry') &&
        f.message.includes('## 1.1.0'),
    );
    expect(orphan).toBeDefined();
    expect(orphan!.component).toBe('@pxlkit/ui-kit');
  });

  it('downgrades the in-flight top entry (matches package.json) to info', async () => {
    const changelog = [
      '# Changelog',
      '',
      '## 1.2.0 — 2026-05-30',
      '- in-flight release, no SHA yet',
      '',
      `## 1.1.0 — 2026-04-01`,
      `- old release (${SHA_B.slice(0, 7)})`,
      '',
    ].join('\n');
    const { packageJsonPath, changelogPath } = await makePackage({
      name: '@pxlkit/ui-kit',
      version: '1.2.0',
      changelog,
    });
    const ctx = mockCtx({
      packageJsons: [{ package: '@pxlkit/ui-kit', path: packageJsonPath }],
      changelogFiles: [{ package: '@pxlkit/ui-kit', path: changelogPath! }],
    });

    const g = new ChangelogCoherentGate({ gitRunner: mockGitRunner([SHA_A, SHA_B]) });
    const r = await g.run(ctx);
    expect(r.passed).toBe(true);
    const infoFinding = r.findings.find(
      (f) =>
        f.severity === 'info' &&
        f.message.includes('orphan changelog entry') &&
        f.message.includes('## 1.2.0'),
    );
    expect(infoFinding).toBeDefined();
    // No minor finding for 1.1.0 because it references a known SHA.
    expect(r.findings.some((f) => f.severity === 'minor')).toBe(false);
  });

  it('flags entries that reference only unknown SHAs as orphan', async () => {
    const changelog = [
      '# Changelog',
      '',
      `## 1.2.0 — 2026-05-30`,
      `- shipped (deadbee)`, // not in git
      '',
    ].join('\n');
    const { packageJsonPath, changelogPath } = await makePackage({
      name: '@pxlkit/ui-kit',
      version: '1.2.0',
      changelog,
    });
    const ctx = mockCtx({
      packageJsons: [{ package: '@pxlkit/ui-kit', path: packageJsonPath }],
      changelogFiles: [{ package: '@pxlkit/ui-kit', path: changelogPath! }],
    });

    const g = new ChangelogCoherentGate({ gitRunner: mockGitRunner([SHA_A]) });
    const r = await g.run(ctx);
    // 1.2.0 is the in-flight top, so this is info (still tolerated).
    const infoFinding = r.findings.find(
      (f) => f.severity === 'info' && f.message.includes('unknown SHAs'),
    );
    expect(infoFinding).toBeDefined();
  });

  it('flags entries with no `## X.Y.Z` sections at all as minor', async () => {
    const { packageJsonPath, changelogPath } = await makePackage({
      name: '@pxlkit/ui-kit',
      version: '1.2.0',
      changelog: '# Changelog\n\nno releases yet\n',
    });
    const ctx = mockCtx({
      packageJsons: [{ package: '@pxlkit/ui-kit', path: packageJsonPath }],
      changelogFiles: [{ package: '@pxlkit/ui-kit', path: changelogPath! }],
    });

    const g = new ChangelogCoherentGate({ gitRunner: mockGitRunner([SHA_A]) });
    const r = await g.run(ctx);
    expect(
      r.findings.some(
        (f) => f.severity === 'minor' && f.message.includes('no `## X.Y.Z` sections'),
      ),
    ).toBe(true);
  });

  it('returns info+pass when there are no CHANGELOG files at all', async () => {
    const ctx = mockCtx({ packageJsons: [], changelogFiles: [] });
    const r = await gate.run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]!.severity).toBe('info');
  });

  it('degrades to info+pass when git is unavailable', async () => {
    const { packageJsonPath, changelogPath } = await makePackage({
      name: '@pxlkit/ui-kit',
      version: '1.2.0',
      changelog: '## 1.2.0\n- thing\n',
    });
    const ctx = mockCtx({
      packageJsons: [{ package: '@pxlkit/ui-kit', path: packageJsonPath }],
      changelogFiles: [{ package: '@pxlkit/ui-kit', path: changelogPath! }],
    });
    const g = new ChangelogCoherentGate({ gitRunner: brokenGitRunner() });
    const r = await g.run(ctx);
    expect(r.passed).toBe(true);
    expect(
      r.findings.some(
        (f) => f.severity === 'info' && f.message.includes('git unavailable'),
      ),
    ).toBe(true);
  });

  it('supports an injected pre-built commit index (skips git entirely)', async () => {
    const changelog = `## 1.0.0 — 2026-05-30\n- ship (${SHA_A.slice(0, 7)})\n`;
    const { packageJsonPath, changelogPath } = await makePackage({
      name: '@pxlkit/ui-kit',
      version: '1.0.0',
      changelog,
    });
    const ctx = mockCtx({
      packageJsons: [{ package: '@pxlkit/ui-kit', path: packageJsonPath }],
      changelogFiles: [{ package: '@pxlkit/ui-kit', path: changelogPath! }],
    });
    // Inject the index directly — gate must NOT call gitRunner here.
    const injected: CommitIndex = buildCommitIndex(tmpRoot, mockGitRunner([SHA_A]));
    const g = new ChangelogCoherentGate({ commitIndex: injected });
    const r = await g.run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
  });

  it('exposes id, name and description matching the contract', () => {
    const g = new ChangelogCoherentGate();
    expect(g.id).toBe(19);
    expect(g.name).toBe('changelog-coherent');
    expect(g.description.toLowerCase()).toContain('changelog');
    expect(g.description.toLowerCase()).toContain('commit');
    expect(g.description.toLowerCase()).toContain('git log');
  });
});
