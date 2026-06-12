import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  evaluate,
  isItemsPropDriven,
  parseChangelogAdded,
  parseConsumerItems,
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
  /** Extra web-app files (relative to apps/web/src) for consumer-item scans. */
  webFiles?: Record<string, string>;
}

async function createFixture(opts: FixtureOpts): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), 'pxlkit-gate-34-'));

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

  for (const [rel, content] of Object.entries(opts.webFiles ?? {})) {
    const target = join(root, 'apps/web/src', rel);
    await mkdir(join(target, '..'), { recursive: true });
    await writeFile(target, content);
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

/**
 * Release-policy fixture: the current version (2.0.1) is a version-only
 * republish with no Added entries; 2.0.0 (em-dash heading, no brackets)
 * carries the advertised content across TWO Added blocks.
 */
const FALLBACK_CHANGELOG = `# @pxlkit/ui-kit — Changelog

## Unreleased

### Fixed
- pending work.

## 2.0.1 — 2026-06-02

### Changed
- Version-only republish to unblock the npm publish pipeline. No API changes.

## 2.0.0 — 2026-05-31 (Launch)

### Added — Data
- **\`PixelToast\`** — toast notifications.
- **\`PixelParallax\`** — parallax wrappers.

### Changed
- copy pass.

### Added — Providers
- **\`PxlKitSurfaceProvider\`** — pixel/linear switch.
`;

describe('gate 34: whatsnew-vs-version', () => {
  const fixtures: Fixture[] = [];

  afterAll(async () => {
    for (const f of fixtures) {
      await rm(f.root, { recursive: true, force: true });
    }
  });

  it('passes when strip items[] match the Added components for the current version', async () => {
    const f = await createFixture({
      stripContent: STRIP_OK,
      changelogContent: CHANGELOG_OK,
      uiKitVersion: '1.6.0',
    });
    fixtures.push(f);

    const result = await whatsnewVsVersionGate({ repoRoot: f.root });
    expect(result.drift).toEqual([]);
  });

  it('allows a curated subset of the Added components (completeness is not required)', async () => {
    const subsetStrip = `
      const DEFAULT_ITEMS = [
        { component: 'PixelToast', blurb: 'x' },
        { component: 'PxlKitSurfaceProvider', blurb: 'y' },
      ];
      export default function Strip(){ return null; }
    `;
    const f = await createFixture({
      stripContent: subsetStrip,
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

  it('fails (major) when the majority of strip items are stale or unknown', async () => {
    const mostlyStaleStrip = `
      const DEFAULT_ITEMS = [
        { component: 'PixelToast', blurb: 'still real' },
        { component: 'GhostFromV1', blurb: 'stale' },
        { component: 'AncientWidget', blurb: 'stale' },
        { component: 'ForgottenThing', blurb: 'stale' },
      ];
      export default function Strip(){ return null; }
    `;
    const f = await createFixture({
      stripContent: mostlyStaleStrip,
      changelogContent: CHANGELOG_OK,
      uiKitVersion: '1.6.0',
    });
    fixtures.push(f);

    const result = await whatsnewVsVersionGate({ repoRoot: f.root });
    const extra = result.drift.find((d) => d.actual.includes('stale or unknown entries'));
    expect(extra).toBeDefined();
    expect(extra?.severity).toBe('major');
    expect(extra?.actual).toContain('GhostFromV1');
  });

  it('fails (major) when NO strip item appears in the advertised Added entries', async () => {
    const fullyStaleStrip = `
      const DEFAULT_ITEMS = [
        { component: 'GhostFromV1', blurb: 'stale' },
      ];
      export default function Strip(){ return null; }
    `;
    const f = await createFixture({
      stripContent: fullyStaleStrip,
      changelogContent: CHANGELOG_OK,
      uiKitVersion: '1.6.0',
    });
    fixtures.push(f);

    const result = await whatsnewVsVersionGate({ repoRoot: f.root });
    const stale = result.drift.find((d) => d.actual.includes('stale highlights'));
    expect(stale).toBeDefined();
    expect(stale?.severity).toBe('major');
    expect(stale?.actual).toContain('GhostFromV1');
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

  it('fails (major) when no release section anywhere has an Added subsection', async () => {
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

  describe('version-only patch fallback', () => {
    it('falls back to the most recent release WITH Added entries and passes', async () => {
      const f = await createFixture({
        stripContent: STRIP_OK,
        changelogContent: FALLBACK_CHANGELOG,
        uiKitVersion: '2.0.1',
      });
      fixtures.push(f);

      const result = await whatsnewVsVersionGate({ repoRoot: f.root });
      expect(result.drift).toEqual([]);
    });

    it('still flags stale items against a NEW release that has Added entries (no fallback)', async () => {
      const newRelease = `# Changelog

## 2.1.0 — 2026-07-01

### Added
- **\`PixelNewThing\`** — brand new component.

## 2.0.0 — 2026-05-31

### Added
- **\`PixelToast\`** — old launch content.
`;
      const f = await createFixture({
        stripContent: STRIP_OK, // still advertises PixelToast & friends
        changelogContent: newRelease,
        uiKitVersion: '2.1.0',
      });
      fixtures.push(f);

      const result = await whatsnewVsVersionGate({ repoRoot: f.root });
      const stale = result.drift.find((d) => d.actual.includes('stale highlights'));
      expect(stale).toBeDefined();
      expect(stale?.severity).toBe('major');
      expect(stale?.expected).toContain('2.1.0');
    });
  });

  describe('prop-driven strips (items wired at call sites)', () => {
    const PROP_DRIVEN_STRIP = `
      'use client';
      import { PixelCard } from '@pxlkit/ui-kit';
      export interface WhatsNewItem { name: string; category: string; }
      export interface WhatsNewStripProps { version: string; items: WhatsNewItem[]; }
      export function WhatsNewStrip({ version, items }: WhatsNewStripProps) {
        return <ul>{items.map((i) => <li key={i.name}>{i.name}</li>)}</ul>;
      }
      export default WhatsNewStrip;
    `;

    it('validates the items statically wired in consumer files', async () => {
      const f = await createFixture({
        stripContent: PROP_DRIVEN_STRIP,
        changelogContent: CHANGELOG_OK,
        uiKitVersion: '1.6.0',
        webFiles: {
          'components/LandingPageClient.tsx': `
            import { WhatsNewStrip, type WhatsNewItem } from './whats-new-strip';
            const WHATS_NEW_ITEMS: WhatsNewItem[] = [
              { name: 'PixelToast', category: 'feedback' },
              { name: 'PixelParallax', category: 'parallax' },
            ];
            export function LandingPageClient() {
              return <WhatsNewStrip version="x" items={WHATS_NEW_ITEMS} />;
            }
          `,
        },
      });
      fixtures.push(f);

      const result = await whatsnewVsVersionGate({ repoRoot: f.root });
      expect(result.drift).toEqual([]);
    });

    it('still flags consumer-wired items that advertise nothing from the advertised release', async () => {
      const f = await createFixture({
        stripContent: PROP_DRIVEN_STRIP,
        changelogContent: CHANGELOG_OK,
        uiKitVersion: '1.6.0',
        webFiles: {
          'components/LandingPageClient.tsx': `
            import { type WhatsNewItem } from './whats-new-strip';
            const WHATS_NEW_ITEMS: WhatsNewItem[] = [
              { name: 'GhostFromV1', category: 'stale' },
              { name: 'AncientWidget', category: 'stale' },
            ];
          `,
        },
      });
      fixtures.push(f);

      const result = await whatsnewVsVersionGate({ repoRoot: f.root });
      const stale = result.drift.find((d) => d.actual.includes('stale highlights'));
      expect(stale).toBeDefined();
      expect(stale?.severity).toBe('major');
    });

    it('fails (major) when the strip is prop-driven but nothing is wired anywhere', async () => {
      const f = await createFixture({
        stripContent: PROP_DRIVEN_STRIP,
        changelogContent: CHANGELOG_OK,
        uiKitVersion: '1.6.0',
      });
      fixtures.push(f);

      const result = await whatsnewVsVersionGate({ repoRoot: f.root });
      const d = result.drift.find((x) => x.actual.includes('no wired items found'));
      expect(d).toBeDefined();
      expect(d?.severity).toBe('major');
    });
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

  it('parseConsumerItems extracts name values only from WhatsNewItem[] arrays', () => {
    const src = `
      const WHATS_NEW: WhatsNewItem[] = [
        { name: 'PixelToast', category: 'feedback' },
        { name: 'PixelParallax', category: 'parallax' },
      ];
      const unrelated = [{ name: 'NotAnItem' }];
    `;
    expect(parseConsumerItems(src)).toEqual(['PixelToast', 'PixelParallax']);
  });

  it('isItemsPropDriven detects an items prop declaration', () => {
    expect(isItemsPropDriven('interface P { items: WhatsNewItem[]; }')).toBe(true);
    expect(isItemsPropDriven('function S({ items }: P) {}')).toBe(true);
    expect(isItemsPropDriven('const x = 1; // no item plumbing')).toBe(false);
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

  it('parseChangelogAdded handles em-dash headings and collects ALL Added blocks', () => {
    expect(parseChangelogAdded(FALLBACK_CHANGELOG, '2.0.0')).toEqual([
      'PixelToast',
      'PixelParallax',
      'PxlKitSurfaceProvider',
    ]);
    expect(parseChangelogAdded(FALLBACK_CHANGELOG, '2.0.1')).toEqual([]);
  });

  it('evaluate() returns blocker when strip is null', () => {
    const drift = evaluate({
      strip: null,
      changelog: '## [1.6.0] - 2026-05-31\n### Added\n- **`X`** — y',
      uiKitPackage: { version: '1.6.0' },
    });
    expect(drift.length).toBe(1);
    expect(drift[0]?.severity).toBe('blocker');
  });
});
