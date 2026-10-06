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
import { findRootReleaseSection, resolveAdvertisedRelease } from '../../_lib/release-policy';

interface Fixture {
  root: string;
}

interface FixtureOpts {
  stripContent: string | null;
  changelogContent: string | null;
  uiKitVersion: string | null;
  /** Extra web-app files (relative to apps/web/src) for consumer-item scans. */
  webFiles?: Record<string, string>;
  /** The root CHANGELOG.md, where releases that span packages are written up. */
  rootChangelogContent?: string;
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

  if (opts.rootChangelogContent !== undefined) {
    await writeFile(join(root, 'CHANGELOG.md'), opts.rootChangelogContent);
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

  describe('release written up in the root CHANGELOG', () => {
    /** The kit's 2.2.0 section lists changes and fixes only; 2.1.0 added components. */
    const KIT_CHANGELOG = `# @pxlkit/ui-kit — Changelog

## 2.2.0 — 2026-10-03

### Changed
- The kit runs on \`@pxlkit/ui-kit-core\`.

### Fixed
- Pages hydrate.

## 2.1.0 — 2026-07-06

### Added
- \`PixelCard\`: \`title\` is optional.
- \`PixelChip\`: \`value\` prop.
`;

    /** The release across packages, with what it added. */
    const ROOT_CHANGELOG = `# Changelog

## [ui-kit 2.2.0 / core 1.4.0 / vue 0.1.0] - 2026-10-03 — The UI kit in Vue and Angular

### Added

- **Vue support.** A new package renders the icons:
  - \`@pxlkit/vue\` (0.1.0) — Vue 3 components.
- **\`@pxlkit/ui-kit-core\`.** The framework-neutral core.
- **The UI kit for Vue.** \`@pxlkit/ui-kit-vue\` renders the React kit's markup.

## [ui-kit 2.1.0] - 2026-07-06 — Cards

### Added

- **\`PixelCard\`** — headerless cards.
`;

    const PROP_DRIVEN_STRIP = `
      'use client';
      export interface WhatsNewItem { name: string; category: string; }
      export function WhatsNewStrip({ version, items }: { version: string; items: WhatsNewItem[] }) {
        return <ul>{items.map((i) => <li key={i.name}>{i.name}</li>)}</ul>;
      }
    `;

    const wired = (names: string[]) => ({
      'lib/whats-new.ts': `
        import type { WhatsNewItem } from '@/components/whats-new-strip';
        export const WHATS_NEW_ITEMS: WhatsNewItem[] = [
          ${names.map((n) => `{ name: '${n}', category: 'x' },`).join('\n          ')}
        ];
      `,
    });

    it("advertises the current version with the root section's Added entries when the kit's own has none", async () => {
      const f = await createFixture({
        stripContent: PROP_DRIVEN_STRIP,
        changelogContent: KIT_CHANGELOG,
        rootChangelogContent: ROOT_CHANGELOG,
        uiKitVersion: '2.2.0',
        webFiles: wired(['@pxlkit/ui-kit-vue', '@pxlkit/vue', '@pxlkit/ui-kit-core']),
      });
      fixtures.push(f);

      const result = await whatsnewVsVersionGate({ repoRoot: f.root });
      expect(result.drift).toEqual([]);
    });

    it('flags the previous release\'s highlights once the root CHANGELOG writes up the current one', async () => {
      const f = await createFixture({
        stripContent: PROP_DRIVEN_STRIP,
        changelogContent: KIT_CHANGELOG,
        rootChangelogContent: ROOT_CHANGELOG,
        uiKitVersion: '2.2.0',
        webFiles: wired(['PixelCard', 'PixelChip']),
      });
      fixtures.push(f);

      const result = await whatsnewVsVersionGate({ repoRoot: f.root });
      const stale = result.drift.find((d) => d.actual.includes('stale highlights'));
      expect(stale).toBeDefined();
      expect(stale?.severity).toBe('major');
      expect(stale?.expected).toContain('v2.2.0');
    });

    it("falls back to the kit's last release with Added entries when the root CHANGELOG has no section for the version", async () => {
      const f = await createFixture({
        stripContent: PROP_DRIVEN_STRIP,
        changelogContent: KIT_CHANGELOG,
        rootChangelogContent: ROOT_CHANGELOG.replace('ui-kit 2.2.0 / ', ''),
        uiKitVersion: '2.2.0',
        webFiles: wired(['PixelCard', 'PixelChip']),
      });
      fixtures.push(f);

      const result = await whatsnewVsVersionGate({ repoRoot: f.root });
      expect(result.drift).toEqual([]);
    });

    // The kit's own section adds props to existing components; the root
    // section holds the release's headline additions.
    const KIT_CHANGELOG_WITH_ADDED = KIT_CHANGELOG.replace(
      '## 2.2.0 — 2026-10-03\n\n### Changed',
      '## 2.2.0 — 2026-10-03\n\n### Added\n- `PixelHeroSection` `as`: the heading level.\n\n### Changed',
    );

    it("advertises the release with the kit section's and the root section's Added entries together", async () => {
      for (const strip of [['@pxlkit/ui-kit-vue', '@pxlkit/vue'], ['PixelHeroSection']]) {
        const f = await createFixture({
          stripContent: PROP_DRIVEN_STRIP,
          changelogContent: KIT_CHANGELOG_WITH_ADDED,
          rootChangelogContent: ROOT_CHANGELOG,
          uiKitVersion: '2.2.0',
          webFiles: wired(strip),
        });
        fixtures.push(f);

        const result = await whatsnewVsVersionGate({ repoRoot: f.root });
        expect(result.drift).toEqual([]);
      }
    });

    it('still flags a strip that advertises neither section of the release', async () => {
      const f = await createFixture({
        stripContent: PROP_DRIVEN_STRIP,
        changelogContent: KIT_CHANGELOG_WITH_ADDED,
        rootChangelogContent: ROOT_CHANGELOG,
        uiKitVersion: '2.2.0',
        webFiles: wired(['PixelCard', 'PixelChip']),
      });
      fixtures.push(f);

      const result = await whatsnewVsVersionGate({ repoRoot: f.root });
      expect(result.drift.some((d) => d.severity === 'major')).toBe(true);
    });

    it('findRootReleaseSection matches the package by name and version, not a package whose name extends it', () => {
      expect(findRootReleaseSection(ROOT_CHANGELOG, 'ui-kit', '2.2.0')?.date).toBe('2026-10-03');
      expect(findRootReleaseSection(ROOT_CHANGELOG, 'ui-kit', '2.1.0')?.heading).toContain('Cards');
      expect(findRootReleaseSection(ROOT_CHANGELOG, 'core', '1.4.0')).not.toBeNull();
      expect(findRootReleaseSection(ROOT_CHANGELOG, 'ui-kit', '2.2')).toBeNull();
      expect(findRootReleaseSection('## [ui-kit-core 2.2.0] - 2026-10-03\n\n### Added\n- `X`\n', 'ui-kit', '2.2.0')).toBeNull();
    });

    it('resolveAdvertisedRelease reports where the Added entries come from', () => {
      const fromRoot = resolveAdvertisedRelease(KIT_CHANGELOG, '2.2.0', { rootChangelog: ROOT_CHANGELOG });
      expect(fromRoot).toMatchObject({ version: '2.2.0', isFallback: false, source: 'root' });
      expect(fromRoot?.added).toEqual(expect.arrayContaining(['@pxlkit/vue', '@pxlkit/ui-kit-core', '@pxlkit/ui-kit-vue']));

      const withoutRoot = resolveAdvertisedRelease(KIT_CHANGELOG, '2.2.0');
      expect(withoutRoot).toMatchObject({ version: '2.1.0', isFallback: true, source: 'package' });

      const both = resolveAdvertisedRelease(KIT_CHANGELOG_WITH_ADDED, '2.2.0', { rootChangelog: ROOT_CHANGELOG });
      expect(both).toMatchObject({ version: '2.2.0', isFallback: false, source: 'both' });
      expect(both?.added[0]).toBe('PixelHeroSection');
      expect(both?.added).toEqual(expect.arrayContaining(['@pxlkit/ui-kit-vue']));

      const packageOnly = resolveAdvertisedRelease(KIT_CHANGELOG_WITH_ADDED, '2.2.0');
      expect(packageOnly).toMatchObject({ version: '2.2.0', source: 'package', added: ['PixelHeroSection'] });
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
