import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  evaluate,
  parseChangelogAdded,
  parseStripItems,
  whatsnewVsVersionGate,
} from '../../gates/34-whatsnew-vs-version';

interface Fixture {
  root: string;
}

interface FixtureOpts {
  stripContent: string | null;
  changelogContent: string | null;
  uiKitVersion: string | null;
}

async function createFixture(opts: FixtureOpts): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), 'pxlkit-gate-32-'));

  await mkdir(join(root, 'apps/web/src/components'), { recursive: true });
  await mkdir(join(root, 'packages/ui-kit'), { recursive: true });

  if (opts.stripContent !== null) {
    await writeFile(
      join(root, 'apps/web/src/components/whats-new-strip.tsx'),
      opts.stripContent,
    );
  }

  if (opts.changelogContent !== null) {
    await writeFile(
      join(root, 'packages/ui-kit/CHANGELOG.md'),
      opts.changelogContent,
    );
  }

  const pkg: Record<string, string> = { name: '@pxlkit/ui-kit' };
  if (opts.uiKitVersion) pkg.version = opts.uiKitVersion;
  await writeFile(
    join(root, 'packages/ui-kit/package.json'),
    JSON.stringify(pkg),
  );

  return { root };
}

const STRIP_OK = `
'use client';
import { PixelCard } from '@pxlkit/ui-kit';

const DEFAULT_ITEMS = [
  { component: 'PixelToast', blurb: 'Pixel-art toast notifications.', tone: 'green' },
  { component: 'PxlKitSurfaceProvider', blurb: 'Switch pixel/linear.', tone: 'gold' },
  { component: 'PixelParallax', blurb: 'Mouse + scroll wrappers.', tone: 'cyan' },
];

export default function WhatsNewStrip({ items = DEFAULT_ITEMS, version = '1.6.0' }) {
  return <PixelCard title={items[0].component}>{version}</PixelCard>;
}
`;

const CHANGELOG_OK = `# Changelog

## [1.6.0] - 2026-05-31 — Highlight pass

### Added — \`@pxlkit/ui-kit\` v1.6.0

- **\`PixelToast\`** — pixel-art toast notifications wired into the kit.
- **\`PxlKitSurfaceProvider\`** — switch pixel/linear aesthetic.
- **\`PixelParallax\`** — mouse + scroll parallax wrappers.

### Fixed

- nothing meaningful.

## [1.5.0] - 2026-05-12 — Earlier release

### Added — \`@pxlkit/ui-kit\` v1.5.0

- **\`LegacyWidget\`** — must not appear in items[].
`;

describe('gate 34: whatsnew-vs-version', () => {
  const fixtures: Fixture[] = [];

  afterAll(async () => {
    for (const f of fixtures) {
      await rm(f.root, { recursive: true, force: true });
    }
  });

  it('passes when strip items[] equals the Added components for the current version', async () => {
    const f = await createFixture({
      stripContent: STRIP_OK,
      changelogContent: CHANGELOG_OK,
      uiKitVersion: '1.6.0',
    });
    fixtures.push(f);

    const result = await whatsnewVsVersionGate({ repoRoot: f.root });
    expect(result.drift).toEqual([]);
  });

  it('fails (blocker) when whats-new-strip.tsx is missing', async () => {
    const f = await createFixture({
      stripContent: null,
      changelogContent: CHANGELOG_OK,
      uiKitVersion: '1.6.0',
    });
    fixtures.push(f);

    const result = await whatsnewVsVersionGate({ repoRoot: f.root });
    expect(result.drift.length).toBe(1);
    expect(result.drift[0]?.severity).toBe('blocker');
    expect(result.drift[0]?.artifact).toContain('whats-new-strip.tsx');
  });

  it('fails (major) with a missing-component message when items[] is incomplete vs Added', async () => {
    const incompleteStrip = `
      const DEFAULT_ITEMS = [
        { component: 'PixelToast', blurb: 'x' },
        { component: 'PxlKitSurfaceProvider', blurb: 'y' },
      ];
      export default function Strip(){ return null; }
    `;
    const f = await createFixture({
      stripContent: incompleteStrip,
      changelogContent: CHANGELOG_OK,
      uiKitVersion: '1.6.0',
    });
    fixtures.push(f);

    const result = await whatsnewVsVersionGate({ repoRoot: f.root });
    const miss = result.drift.find((d) => d.actual.includes('Missing from strip'));
    expect(miss).toBeDefined();
    expect(miss?.severity).toBe('major');
    expect(miss?.actual).toContain('PixelParallax');
  });

  it('fails (major) when strip carries stale entries not in current Added', async () => {
    const staleStrip = `
      const DEFAULT_ITEMS = [
        { component: 'PixelToast', blurb: 'x' },
        { component: 'PxlKitSurfaceProvider', blurb: 'y' },
        { component: 'PixelParallax', blurb: 'z' },
        { component: 'GhostFromV1', blurb: 'stale' },
      ];
      export default function Strip(){ return null; }
    `;
    const f = await createFixture({
      stripContent: staleStrip,
      changelogContent: CHANGELOG_OK,
      uiKitVersion: '1.6.0',
    });
    fixtures.push(f);

    const result = await whatsnewVsVersionGate({ repoRoot: f.root });
    const extra = result.drift.find((d) => d.actual.includes('Stale or unknown entries'));
    expect(extra).toBeDefined();
    expect(extra?.severity).toBe('major');
    expect(extra?.actual).toContain('GhostFromV1');
  });

  it('fails (major) when CHANGELOG.md is missing entirely', async () => {
    const f = await createFixture({
      stripContent: STRIP_OK,
      changelogContent: null,
      uiKitVersion: '1.6.0',
    });
    fixtures.push(f);

    const result = await whatsnewVsVersionGate({ repoRoot: f.root });
    expect(result.drift.length).toBe(1);
    expect(result.drift[0]?.severity).toBe('major');
    expect(result.drift[0]?.artifact).toBe('packages/ui-kit/CHANGELOG.md');
  });

  it('fails (major) when CHANGELOG has the version but no Added section', async () => {
    const noAdded = `# Changelog

## [1.6.0] - 2026-05-31

### Changed

- copy tweaks only.
`;
    const f = await createFixture({
      stripContent: STRIP_OK,
      changelogContent: noAdded,
      uiKitVersion: '1.6.0',
    });
    fixtures.push(f);

    const result = await whatsnewVsVersionGate({ repoRoot: f.root });
    const d = result.drift.find((x) => x.actual.includes('No "### Added"'));
    expect(d).toBeDefined();
    expect(d?.severity).toBe('major');
  });

  it('parseStripItems extracts component string values', () => {
    const src = `
      const items = [
        { component: 'PixelToast', blurb: 'x' },
        { component: "PxlKitSurfaceProvider", blurb: 'y' },
        { component: 'PixelToast', blurb: 'duplicate' },
      ];
    `;
    expect(parseStripItems(src)).toEqual(['PixelToast', 'PxlKitSurfaceProvider']);
  });

  it('parseChangelogAdded scopes to the right version and pulls backticked names', () => {
    const cl = `# Changelog

## [1.6.0] - 2026-05-31

### Added — \`@pxlkit/ui-kit\` v1.6.0

- **\`PixelToast\`** — note.
- **\`PixelParallax\`** — note.

## [1.5.0] - 2026-05-12

### Added

- **\`LegacyWidget\`** — should not bleed into 1.6.0 results.
`;
    expect(parseChangelogAdded(cl, '1.6.0')).toEqual(['PixelToast', 'PixelParallax']);
    expect(parseChangelogAdded(cl, '1.5.0')).toEqual(['LegacyWidget']);
  });

  it('evaluate() returns blocker when strip is null', () => {
    const drift = evaluate({
      strip: null,
      changelog: '## [1.6.0]\n### Added\n- **`X`** — y',
      uiKitPackage: { version: '1.6.0' },
    });
    expect(drift.length).toBe(1);
    expect(drift[0]?.severity).toBe('blocker');
  });
});
