import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  changelogVsGitGate,
  evaluate,
  extractRefs,
  foldBullets,
  isCommitCovered,
  isUserFacing,
  loadInputs,
  parseGitLog,
  parseReleases,
  touchesUiKitSource,
  type GateInputs,
  type GitCommit,
} from '../../gates/32-changelog-vs-git';

interface Fixture {
  root: string;
}

async function createFixture(opts: {
  changelog: string | null;
  uiKitChangelog?: string | null;
}): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), 'pxlkit-gate-32-'));
  await mkdir(root, { recursive: true });
  if (opts.changelog !== null) {
    await writeFile(join(root, 'CHANGELOG.md'), opts.changelog);
  }
  if (opts.uiKitChangelog) {
    await mkdir(join(root, 'packages/ui-kit'), { recursive: true });
    await writeFile(join(root, 'packages/ui-kit/CHANGELOG.md'), opts.uiKitChangelog);
  }
  return { root };
}

/** Render commits in the \x01/\x02 record format the gate's git log uses. */
function gitLogOutput(commits: GitCommit[]): string {
  return commits
    .map(
      (c) =>
        `\x01${c.sha}\t${c.date ?? '2026-06-10'}\t${c.subject}\n${c.body ?? ''}\x02\n` +
        `${(c.files ?? []).join('\n')}\n`,
    )
    .join('\n');
}

function mockGit(commits: GitCommit[]) {
  return async (_args: string[], _cwd: string) => gitLogOutput(commits);
}

const ROOT_CHANGELOG = `# Changelog

## [ui 1.2.5] - 2026-05-28 — UI pack refinement

### Fixed
- settings icon redesigned for legibility
`;

/**
 * Release-policy-shaped ui-kit changelog: an "## Unreleased" accumulator
 * above the latest (em-dash style) release heading.
 */
const UI_KIT_CHANGELOG = `# @pxlkit/ui-kit — Changelog

## Unreleased

### Changed
- Internal layout: toast and locale providers extracted into dedicated files (wave summary).

### Fixed
- \`PixelWidget\` no longer drops focus on blur.
- a11y: corrected roles across dialog components, clearing axe findings.
- hardening pass landed in deadbee1.

## 2.0.1 — 2026-06-02

### Changed
- Version-only republish. No API changes.

## 2.0.0 — 2026-05-31

### Released
- Master overhaul.
`;

function inputs(commits: GitCommit[], overrides: Partial<GateInputs> = {}): GateInputs {
  return {
    changelog: ROOT_CHANGELOG,
    uiKitChangelog: UI_KIT_CHANGELOG,
    commitsSinceLastRelease: commits,
    gitAvailable: true,
    ...overrides,
  };
}

const UI_KIT_SRC = ['packages/ui-kit/src/forms/PixelWidget.tsx'];

describe('gate 32: changelog vs git (release-policy aware)', () => {
  const fixtures: Fixture[] = [];

  afterAll(async () => {
    for (const f of fixtures) {
      await rm(f.root, { recursive: true, force: true });
    }
  });

  describe('parseReleases', () => {
    it('extracts multiple release headings with their bodies', () => {
      const cl = `# Changelog

## [ui 1.2.5] - 2026-05-28 — UI pack
- entry A

## [social 1.2.4] - 2026-05-27 — Social pack
- entry B
`;
      const releases = parseReleases(cl);
      expect(releases).toHaveLength(2);
      expect(releases[0]?.slug).toBe('ui 1.2.5');
      expect(releases[0]?.date).toBe('2026-05-28');
      expect(releases[0]?.body).toContain('entry A');
      expect(releases[1]?.slug).toBe('social 1.2.4');
      expect(releases[1]?.body).toContain('entry B');
    });

    it('returns empty array when no headings match', () => {
      expect(parseReleases('# just a heading\n\nno releases here')).toEqual([]);
    });
  });

  describe('extractRefs', () => {
    it('captures PR refs and sha refs', () => {
      const body = '- fixed bug (#123) and another in abc1234ef';
      const refs = extractRefs(body);
      expect(refs.prs).toEqual(['123']);
      expect(refs.shas).toContain('abc1234ef');
    });

    it('returns empty arrays when nothing is referenced', () => {
      const refs = extractRefs('- plain bullet with no refs');
      expect(refs.prs).toEqual([]);
      expect(refs.shas).toEqual([]);
    });
  });

  describe('isUserFacing', () => {
    it('flags feat/fix/perf/refactor/revert as release-policy relevant', () => {
      expect(isUserFacing('feat: add foo')).toBe(true);
      expect(isUserFacing('fix(ui): broken pad')).toBe(true);
      expect(isUserFacing('perf: faster loop')).toBe(true);
      expect(isUserFacing('feat!: breaking api')).toBe(true);
      expect(isUserFacing('revert: bad commit')).toBe(true);
      expect(isUserFacing('refactor(ui-kit): split bulk files')).toBe(true);
    });

    it('skips chore/docs/test/ci/style', () => {
      expect(isUserFacing('chore: bump deps')).toBe(false);
      expect(isUserFacing('docs: tweak readme')).toBe(false);
      expect(isUserFacing('test: add coverage')).toBe(false);
      expect(isUserFacing('ci: bump action')).toBe(false);
      expect(isUserFacing('style: prettier pass')).toBe(false);
    });
  });

  describe('touchesUiKitSource', () => {
    it('accepts ui-kit source files', () => {
      expect(touchesUiKitSource(['packages/ui-kit/src/forms/PixelInput.tsx'])).toBe(true);
      expect(touchesUiKitSource(['packages/ui-kit/package.json'])).toBe(true);
      expect(touchesUiKitSource(['packages/ui-kit/src/cards/X.manifest.ts'])).toBe(true);
    });

    it('rejects tests, stories, markdown, and non-ui-kit paths', () => {
      expect(touchesUiKitSource(['packages/ui-kit/src/__tests__/forms/PixelInput.test.tsx'])).toBe(false);
      expect(touchesUiKitSource(['packages/ui-kit/src/forms/PixelInput.test.tsx'])).toBe(false);
      expect(touchesUiKitSource(['packages/ui-kit/src/forms/PixelInput.stories.tsx'])).toBe(false);
      expect(touchesUiKitSource(['packages/ui-kit/README.md'])).toBe(false);
      expect(touchesUiKitSource(['scripts/audit-coherence/gates/32-changelog-vs-git.ts'])).toBe(false);
      expect(touchesUiKitSource(['apps/web/src/app/page.tsx'])).toBe(false);
      expect(touchesUiKitSource(['.github/workflows/ci.yml'])).toBe(false);
      expect(touchesUiKitSource([])).toBe(false);
      expect(touchesUiKitSource(undefined)).toBe(false);
    });
  });

  describe('isCommitCovered heuristics', () => {
    const bullets = foldBullets(UI_KIT_CHANGELOG);
    const pool = UI_KIT_CHANGELOG;

    it('covers via component name in the subject', () => {
      const c: GitCommit = { sha: 'aaaaaaaa1', subject: 'fix(ui-kit): PixelWidget focus loss on blur' };
      expect(isCommitCovered(c, bullets, pool)).toBe(true);
    });

    it('covers via component name in the body (change summary)', () => {
      const c: GitCommit = {
        sha: 'aaaaaaaa2',
        subject: 'fix(ui-kit): correct dependency declaration',
        body: 'PixelWidget imports embla types directly so declare the dep.',
      };
      expect(isCommitCovered(c, bullets, pool)).toBe(true);
    });

    it('covers a wave of commits via >=2 keyword overlap with one bullet', () => {
      const a: GitCommit = { sha: 'aaaaaaaa3', subject: 'refactor(ui-kit): extract toast provider into dedicated file' };
      const b: GitCommit = { sha: 'aaaaaaaa4', subject: 'refactor(ui-kit): extract locale provider next to its manifest' };
      expect(isCommitCovered(a, bullets, pool)).toBe(true);
      expect(isCommitCovered(b, bullets, pool)).toBe(true);
    });

    it('covers via sha reference', () => {
      const c: GitCommit = { sha: 'deadbee1234567890', subject: 'fix(ui-kit): opaque subject nothing matches' };
      expect(isCommitCovered(c, bullets, pool)).toBe(true);
    });

    it('does not cover on a single generic keyword hit', () => {
      const c: GitCommit = { sha: 'aaaaaaaa5', subject: 'feat(ui-kit): add PixelRocketLauncher confetti burst' };
      expect(isCommitCovered(c, bullets, pool)).toBe(false);
    });
  });

  describe('evaluate — ui-kit release-policy check', () => {
    it('exempts chore/docs/test/ci commits even when they touch ui-kit source', () => {
      const drift = evaluate(
        inputs([
          { sha: '1111111111111', subject: 'test(ui-kit): per-component tests', date: '2026-06-11', files: UI_KIT_SRC },
          { sha: '2222222222222', subject: 'chore(ui-kit): tighten tsconfig', date: '2026-06-11', files: UI_KIT_SRC },
          { sha: '3333333333333', subject: 'docs(ui-kit): document export ordering', date: '2026-06-11', files: UI_KIT_SRC },
          { sha: '4444444444444', subject: 'ci: run scripts vitest suites', date: '2026-06-11', files: UI_KIT_SRC },
        ]),
      );
      expect(drift).toEqual([]);
    });

    it('exempts user-facing commits that only touch scripts/, .github/ or apps/web', () => {
      const drift = evaluate(
        inputs([
          { sha: '1111111111111', subject: 'fix(audit): calibrate detector', date: '2026-06-11', files: ['scripts/audit-coherence/gates/20-x.ts'] },
          { sha: '2222222222222', subject: 'feat(web): wire SSOT reference', date: '2026-06-11', files: ['apps/web/src/app/docs/page.tsx'] },
          { sha: '3333333333333', subject: 'fix(ci): coherence audit actually runs', date: '2026-06-11', files: ['.github/workflows/coherence.yml'] },
        ]),
      );
      expect(drift).toEqual([]);
    });

    it('exempts user-facing ui-kit commits that only touch test files', () => {
      const drift = evaluate(
        inputs([
          {
            sha: '1111111111111',
            subject: 'fix(ui-kit): flaky assertion in dropdown spec',
            date: '2026-06-11',
            files: ['packages/ui-kit/src/__tests__/overlays/PixelDropdown.test.tsx'],
          },
        ]),
      );
      expect(drift).toEqual([]);
    });

    it('accepts coverage by an Unreleased bullet (component name match)', () => {
      const drift = evaluate(
        inputs([
          { sha: '1111111111111', subject: 'fix(ui-kit): PixelWidget focus loss on blur', date: '2026-06-11', files: UI_KIT_SRC },
        ]),
      );
      expect(drift).toEqual([]);
    });

    it('accepts one wave-summary bullet covering several commits', () => {
      const drift = evaluate(
        inputs([
          {
            sha: '1111111111111',
            subject: 'refactor(ui-kit): extract toast provider into dedicated file',
            date: '2026-06-11',
            files: ['packages/ui-kit/src/feedback/toast-provider.tsx'],
          },
          {
            sha: '2222222222222',
            subject: 'refactor(ui-kit): extract locale provider next to its manifest',
            date: '2026-06-11',
            files: ['packages/ui-kit/src/overlay-foundation/locale-provider.tsx'],
          },
        ]),
      );
      expect(drift).toEqual([]);
    });

    it('still flags a user-facing ui-kit commit with NO covering bullet anywhere', () => {
      const drift = evaluate(
        inputs([
          {
            sha: 'ffffffffffffff',
            subject: 'feat(ui-kit): add PixelRocketLauncher confetti burst',
            date: '2026-06-11',
            files: ['packages/ui-kit/src/actions/PixelRocketLauncher.tsx'],
          },
        ]),
      );
      expect(drift).toHaveLength(1);
      expect(drift[0]?.artifact).toBe('packages/ui-kit/CHANGELOG.md');
      expect(drift[0]?.severity).toBe('major');
      expect(drift[0]?.expected).toContain('PixelRocketLauncher');
    });

    it('exempts commits dated the same day as the latest release (rolled into it)', () => {
      const drift = evaluate(
        inputs([
          {
            sha: 'ffffffffffffff',
            subject: 'fix(ui-kit): uncovered same-day change',
            date: '2026-06-02',
            files: UI_KIT_SRC,
          },
        ]),
      );
      expect(drift).toEqual([]);
    });

    it('skips the policy check when the ui-kit changelog is absent', () => {
      const drift = evaluate(
        inputs(
          [
            {
              sha: 'ffffffffffffff',
              subject: 'feat(ui-kit): totally uncovered',
              date: '2026-06-11',
              files: UI_KIT_SRC,
            },
          ],
          { uiKitChangelog: null },
        ),
      );
      expect(drift).toEqual([]);
    });
  });

  describe('evaluate — structural and root sha-ref checks', () => {
    it('returns major drift when CHANGELOG.md is absent', () => {
      const drift = evaluate(inputs([], { changelog: null }));
      expect(drift).toHaveLength(1);
      expect(drift[0]?.severity).toBe('major');
      expect(drift[0]?.artifact).toBe('CHANGELOG.md');
    });

    it('returns major drift when CHANGELOG has no release headings', () => {
      const drift = evaluate(inputs([], { changelog: '# Changelog\n\nNothing yet' }));
      expect(drift).toHaveLength(1);
      expect(drift[0]?.expected).toContain('release heading');
    });

    it('returns minor drift when git is unavailable', () => {
      const drift = evaluate(inputs([], { gitAvailable: false }));
      expect(drift).toHaveLength(1);
      expect(drift[0]?.severity).toBe('minor');
    });

    it('flags CHANGELOG sha references that point to no real commit', () => {
      const drift = evaluate(
        inputs([{ sha: 'abc1234efabcdef', subject: 'feat: real thing' }], {
          changelog: `## [x 1.0.0] - 2026-05-28
- something landed in 9999999 but the sha is fake
`,
          uiKitChangelog: null,
        }),
      );
      const dangling = drift.find((d) => d.expected.includes('9999999'));
      expect(dangling).toBeDefined();
      expect(dangling?.severity).toBe('major');
    });

    it('accepts sha references that resolve to real commits', () => {
      const drift = evaluate(
        inputs([{ sha: 'abc1234efabcdef', subject: 'fix(ui): settings icon' }], {
          changelog: `## [ui 1.2.5] - 2026-05-28
- settings icon redesigned (abc1234)
`,
          uiKitChangelog: null,
        }),
      );
      expect(drift).toEqual([]);
    });
  });

  describe('parseGitLog', () => {
    it('parses sha, date, subject, body and files from the record format', () => {
      const raw = gitLogOutput([
        {
          sha: 'abc1234efabcdef',
          date: '2026-06-11',
          subject: 'fix(ui-kit): something',
          body: 'Longer explanation\nmentioning PixelWidget.',
          files: ['packages/ui-kit/src/forms/PixelWidget.tsx', 'scripts/x.ts'],
        },
        { sha: 'deadbeefdeadbee', date: '2026-06-12', subject: 'docs: readme', files: [] },
      ]);
      const commits = parseGitLog(raw);
      expect(commits).toHaveLength(2);
      expect(commits[0]).toMatchObject({
        sha: 'abc1234efabcdef',
        date: '2026-06-11',
        subject: 'fix(ui-kit): something',
      });
      expect(commits[0]?.body).toContain('PixelWidget');
      expect(commits[0]?.files).toEqual([
        'packages/ui-kit/src/forms/PixelWidget.tsx',
        'scripts/x.ts',
      ]);
      expect(commits[1]?.subject).toBe('docs: readme');
      expect(commits[1]?.files).toEqual([]);
    });
  });

  describe('loadInputs + gate', () => {
    it('reads both changelogs and queries git since the older release date', async () => {
      const f = await createFixture({ changelog: ROOT_CHANGELOG, uiKitChangelog: UI_KIT_CHANGELOG });
      fixtures.push(f);

      let seenArgs: string[] = [];
      const inputsLoaded = await loadInputs(f.root, {
        runGit: async (args: string[]) => {
          seenArgs = args;
          return gitLogOutput([
            { sha: 'abc1234efabcdef', date: '2026-06-11', subject: 'fix(ui-kit): PixelWidget focus loss', files: UI_KIT_SRC },
          ]);
        },
      });

      // Root release 2026-05-28 is older than ui-kit release 2026-06-02.
      expect(seenArgs).toContain('--since=2026-05-28');
      expect(inputsLoaded.changelog).toContain('ui 1.2.5');
      expect(inputsLoaded.uiKitChangelog).toContain('## Unreleased');
      expect(inputsLoaded.gitAvailable).toBe(true);
      expect(inputsLoaded.commitsSinceLastRelease).toHaveLength(1);
      expect(inputsLoaded.commitsSinceLastRelease[0]?.files).toEqual(UI_KIT_SRC);
    });

    it('marks gitAvailable=false when the runner throws', async () => {
      const f = await createFixture({ changelog: ROOT_CHANGELOG });
      fixtures.push(f);

      const inputsLoaded = await loadInputs(f.root, {
        runGit: async () => {
          throw new Error('git not available');
        },
      });

      expect(inputsLoaded.gitAvailable).toBe(false);
    });

    it('end-to-end gate returns a GateResult shape', async () => {
      const f = await createFixture({ changelog: ROOT_CHANGELOG });
      fixtures.push(f);
      // We can't easily mock the real git call in the gate facade, so we
      // simply confirm the result shape is correct against a real (or absent) git.
      const result = await changelogVsGitGate({ repoRoot: f.root });
      expect(result.gateId).toBe('32-changelog-vs-git');
      expect(result.description).toMatch(/CHANGELOG/i);
      expect(Array.isArray(result.drift)).toBe(true);
    });
  });
});
