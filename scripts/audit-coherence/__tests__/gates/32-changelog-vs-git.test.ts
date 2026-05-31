import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  changelogVsGitGate,
  evaluate,
  extractRefs,
  isUserFacing,
  loadInputs,
  parseReleases,
  type GateInputs,
  type GitCommit,
} from '../../gates/32-changelog-vs-git';

interface Fixture {
  root: string;
}

async function createFixture(opts: {
  changelog: string | null;
}): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), 'pxlkit-gate-32-'));
  await mkdir(root, { recursive: true });
  if (opts.changelog !== null) {
    await writeFile(join(root, 'CHANGELOG.md'), opts.changelog);
  }
  return { root };
}

function mockGit(commits: GitCommit[]) {
  return async (_args: string[], _cwd: string) => {
    return commits.map((c) => `${c.sha}\t${c.subject}`).join('\n');
  };
}

const SAMPLE_CHANGELOG = `# Changelog

## [ui 1.2.5] - 2026-05-28 — UI pack refinement

### Fixed
- settings icon redesigned for legibility (abc1234)
- feat: add dots-menu component
`;

describe('gate 32: changelog vs git', () => {
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
    it('flags feat/fix/perf/breaking/revert as user-facing', () => {
      expect(isUserFacing('feat: add foo')).toBe(true);
      expect(isUserFacing('fix(ui): broken pad')).toBe(true);
      expect(isUserFacing('perf: faster loop')).toBe(true);
      expect(isUserFacing('feat!: breaking api')).toBe(true);
      expect(isUserFacing('revert: bad commit')).toBe(true);
    });

    it('skips chore/docs/test/refactor/ci', () => {
      expect(isUserFacing('chore: bump deps')).toBe(false);
      expect(isUserFacing('docs: tweak readme')).toBe(false);
      expect(isUserFacing('test: add coverage')).toBe(false);
      expect(isUserFacing('refactor: cleanup')).toBe(false);
      expect(isUserFacing('ci: bump action')).toBe(false);
    });
  });

  describe('evaluate', () => {
    it('returns major drift when CHANGELOG.md is absent', () => {
      const inputs: GateInputs = {
        changelog: null,
        commitsSinceLastRelease: [],
        gitAvailable: true,
      };
      const drift = evaluate(inputs);
      expect(drift).toHaveLength(1);
      expect(drift[0]?.severity).toBe('major');
      expect(drift[0]?.artifact).toBe('CHANGELOG.md');
    });

    it('returns major drift when CHANGELOG has no release headings', () => {
      const inputs: GateInputs = {
        changelog: '# Changelog\n\nNothing yet',
        commitsSinceLastRelease: [],
        gitAvailable: true,
      };
      const drift = evaluate(inputs);
      expect(drift).toHaveLength(1);
      expect(drift[0]?.expected).toContain('release heading');
    });

    it('returns minor drift when git is unavailable', () => {
      const inputs: GateInputs = {
        changelog: SAMPLE_CHANGELOG,
        commitsSinceLastRelease: [],
        gitAvailable: false,
      };
      const drift = evaluate(inputs);
      expect(drift).toHaveLength(1);
      expect(drift[0]?.severity).toBe('minor');
    });

    it('passes when every user-facing commit is mentioned by subject or sha', () => {
      const inputs: GateInputs = {
        changelog: SAMPLE_CHANGELOG,
        commitsSinceLastRelease: [
          { sha: 'abc1234efabcdef', subject: 'fix(ui): settings icon redesigned for legibility' },
          { sha: 'deadbeefdeadbee', subject: 'feat: add dots-menu component' },
          { sha: 'cafefacecafefac', subject: 'chore: bump tsup' },
        ],
        gitAvailable: true,
      };
      const drift = evaluate(inputs);
      expect(drift).toEqual([]);
    });

    it('flags user-facing commits that have no CHANGELOG entry', () => {
      const inputs: GateInputs = {
        changelog: SAMPLE_CHANGELOG,
        commitsSinceLastRelease: [
          { sha: 'ffffffffffffff', subject: 'feat: brand new export pipeline' },
        ],
        gitAvailable: true,
      };
      const drift = evaluate(inputs);
      expect(drift.length).toBeGreaterThanOrEqual(1);
      const missing = drift.find((d) => d.expected.includes('brand new export pipeline'));
      expect(missing).toBeDefined();
      expect(missing?.severity).toBe('major');
    });

    it('flags CHANGELOG sha references that point to no real commit', () => {
      const inputs: GateInputs = {
        changelog: `## [x 1.0.0] - 2026-05-28
- something landed in 9999999 but the sha is fake
`,
        commitsSinceLastRelease: [
          { sha: 'abc1234efabcdef', subject: 'feat: real thing' },
        ],
        gitAvailable: true,
      };
      const drift = evaluate(inputs);
      const dangling = drift.find((d) => d.expected.includes('9999999'));
      expect(dangling).toBeDefined();
      expect(dangling?.severity).toBe('major');
    });

    it('does not flag chore/docs/test commits as missing entries', () => {
      const inputs: GateInputs = {
        changelog: SAMPLE_CHANGELOG,
        commitsSinceLastRelease: [
          { sha: 'abc1234efabcdef', subject: 'fix(ui): settings icon redesigned for legibility' },
          { sha: 'deadbeefdeadbee', subject: 'feat: add dots-menu component' },
          { sha: '1111111111111', subject: 'chore: bump deps' },
          { sha: '2222222222222', subject: 'docs: tweak readme' },
          { sha: '3333333333333', subject: 'refactor: extract helper' },
        ],
        gitAvailable: true,
      };
      const drift = evaluate(inputs);
      expect(drift).toEqual([]);
    });
  });

  describe('loadInputs + gate', () => {
    it('reads CHANGELOG from disk and invokes the injected git runner', async () => {
      const f = await createFixture({ changelog: SAMPLE_CHANGELOG });
      fixtures.push(f);

      const inputs = await loadInputs(f.root, {
        runGit: mockGit([
          { sha: 'abc1234efabcdef', subject: 'fix(ui): settings icon redesigned for legibility' },
          { sha: 'deadbeefdeadbee', subject: 'feat: add dots-menu component' },
        ]),
      });

      expect(inputs.changelog).toContain('ui 1.2.5');
      expect(inputs.gitAvailable).toBe(true);
      expect(inputs.commitsSinceLastRelease).toHaveLength(2);
    });

    it('marks gitAvailable=false when the runner throws', async () => {
      const f = await createFixture({ changelog: SAMPLE_CHANGELOG });
      fixtures.push(f);

      const inputs = await loadInputs(f.root, {
        runGit: async () => {
          throw new Error('git not available');
        },
      });

      expect(inputs.gitAvailable).toBe(false);
    });

    it('end-to-end gate returns a GateResult shape', async () => {
      const f = await createFixture({ changelog: SAMPLE_CHANGELOG });
      fixtures.push(f);
      // We can't easily mock the real git call in the gate facade, so we
      // simply confirm the result shape is correct against a real (or absent) git.
      const result = await changelogVsGitGate({ repoRoot: f.root });
      expect(result.gateId).toBe('32-changelog-vs-git');
      expect(result.description).toMatch(/CHANGELOG/);
      expect(Array.isArray(result.drift)).toBe(true);
    });
  });
});
