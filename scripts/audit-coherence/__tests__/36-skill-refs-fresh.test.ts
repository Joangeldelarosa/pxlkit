import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

import {
  computeDigestHash,
  serializeManifests,
} from '../../build-docs/generate-skill-refs.js';
import { skillRefsFreshGate } from '../gates/36-skill-refs-fresh';

// ---------------------------------------------------------------------------
// Fixture
//
// Everything runs against a throwaway directory: the gate walks real files, so
// pointing it at the repo would make the assertions depend on whatever the
// working tree happens to look like today.
// ---------------------------------------------------------------------------

const REGISTRY_TS = `export const UI_KIT_COMPONENTS = [
  "PixelButton",
  "PixelCard",
] as const;

export const COMPONENT_META = [
  { name: "PixelButton", category: "actions" },
  { name: "PixelCard", category: "cards" },
];
`;
const TOKENS_TS = 'export const tokens = { space: 4 };\n';
const COMMON_TSX = 'export const PxlKitSurfaceProvider = () => null;\n';
const STYLES_CSS = ':root { --pxl-space: 4px; }\n';
const CORE_TYPES_TS = 'export type Tone = "neutral";\n';
const INDEX_TSX = 'export { PxlKitSurfaceProvider } from "./common";\n';

/** The digest the gate must arrive at for a fixture with no manifests. */
function expectedDigest(): string {
  return computeDigestHash({
    tokens: TOKENS_TS,
    common: COMMON_TSX,
    styles: STYLES_CSS,
    coreTypes: CORE_TYPES_TS,
    manifests: serializeManifests([]),
  });
}

interface FixtureOptions {
  /** digestHash written into VERSION.json. Defaults to the correct one. */
  digestHash?: string;
  /** Version written into packages/ui-kit/package.json AND VERSION.json#uiKit. */
  uiKitVersion?: string;
  /** Overrides VERSION.json#uiKit alone, to simulate a stale corpus. */
  versionFileUiKit?: string;
  pluginVersion?: string;
  marketplaceVersion?: string;
  /** Overrides VERSION.json#plugin alone. Defaults to `pluginVersion`. */
  versionFilePlugin?: string;
  /** Contents of references/pixelate-map.md. Omit to leave the file absent. */
  pixelateMap?: string;
}

async function createFixture(opts: FixtureOptions = {}): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'pxlkit-gate-36-'));

  await mkdir(join(root, 'packages/ui-kit/src'), { recursive: true });
  await mkdir(join(root, 'packages/core/src'), { recursive: true });
  await mkdir(join(root, 'plugins/pxlkit/.claude-plugin'), { recursive: true });
  await mkdir(join(root, 'plugins/pxlkit/references'), { recursive: true });
  await mkdir(join(root, '.claude-plugin'), { recursive: true });

  await writeFile(join(root, 'packages/ui-kit/src/registry.generated.ts'), REGISTRY_TS);

  // The oracle reads component *files*, so the fixture needs them. PixelIconButton
  // is deliberately included without a manifest and without an index.tsx export:
  // that is the real shape that broke CI, and it must stay covered.
  await mkdir(join(root, 'packages/ui-kit/src/actions'), { recursive: true });
  await mkdir(join(root, 'packages/ui-kit/src/cards'), { recursive: true });
  await writeFile(join(root, 'packages/ui-kit/src/actions/PixelButton.tsx'), 'export const PixelButton = () => null;\n');
  await writeFile(join(root, 'packages/ui-kit/src/actions/PixelIconButton.tsx'), 'export const PixelIconButton = () => null;\n');
  await writeFile(join(root, 'packages/ui-kit/src/cards/PixelCard.tsx'), 'export const PixelCard = () => null;\n');
  await writeFile(join(root, 'packages/ui-kit/src/tokens.ts'), TOKENS_TS);
  await writeFile(join(root, 'packages/ui-kit/src/common.tsx'), COMMON_TSX);
  await writeFile(join(root, 'packages/ui-kit/src/index.tsx'), INDEX_TSX);
  await writeFile(join(root, 'packages/ui-kit/styles.css'), STYLES_CSS);
  await writeFile(join(root, 'packages/core/src/types.ts'), CORE_TYPES_TS);

  const uiKit = opts.uiKitVersion ?? '2.1.1';
  const pluginVersion = opts.pluginVersion ?? '1.0.0';

  // The kit's own manifest is the oracle for the digest-provenance check.
  await writeFile(
    join(root, 'packages/ui-kit/package.json'),
    `${JSON.stringify({ name: '@pxlkit/ui-kit', version: uiKit }, null, 2)}\n`,
  );

  await writeFile(
    join(root, 'plugins/pxlkit/references/VERSION.json'),
    `${JSON.stringify(
      {
        plugin: opts.versionFilePlugin ?? pluginVersion,
        uiKit: opts.versionFileUiKit ?? uiKit,
        date: '2026-08-08',
        digestHash: opts.digestHash ?? expectedDigest(),
      },
      null,
      2,
    )}\n`,
  );

  await writeFile(
    join(root, 'plugins/pxlkit/.claude-plugin/plugin.json'),
    `${JSON.stringify({ name: 'pxlkit', version: pluginVersion }, null, 2)}\n`,
  );

  await writeFile(
    join(root, '.claude-plugin/marketplace.json'),
    `${JSON.stringify(
      {
        name: 'pxlkit',
        plugins: [
          {
            name: 'pxlkit',
            source: './plugins/pxlkit',
            version: opts.marketplaceVersion ?? pluginVersion,
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  if (opts.pixelateMap !== undefined) {
    await writeFile(
      join(root, 'plugins/pxlkit/references/pixelate-map.md'),
      opts.pixelateMap,
    );
  }

  return root;
}

describe('gate 36: skill-refs-fresh', () => {
  const roots: string[] = [];

  const fixture = async (opts?: FixtureOptions): Promise<string> => {
    const root = await createFixture(opts);
    roots.push(root);
    return root;
  };

  afterAll(async () => {
    for (const root of roots) {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('(a) reports no drift when the digest matches and versions are aligned', async () => {
    const repoRoot = await fixture();
    const result = await skillRefsFreshGate({ repoRoot });

    expect(result.gateId).toBe('36-skill-refs-fresh');
    expect(result.drift).toEqual([]);
  });

  it('(b) flags a stale digest and names the command that fixes it', async () => {
    const repoRoot = await fixture({ digestHash: 'deadbeef' });
    const result = await skillRefsFreshGate({ repoRoot });

    expect(result.drift).toHaveLength(1);
    const [item] = result.drift;
    expect(item.severity).toBe('major');
    expect(item.artifact).toContain('VERSION.json');
    expect(item.actual).toContain('npm run docs:build');
    expect(item.actual.endsWith('run npm run docs:build and commit the regenerated references')).toBe(
      true,
    );
  });

  it('(c) flags a marketplace entry that lags plugin.json', async () => {
    // A marketplace advertising an older version than the plugin ships is a
    // silently wrong install: users get 1.0.0 while the catalogue says 0.9.0.
    const repoRoot = await fixture({ pluginVersion: '1.0.0', marketplaceVersion: '0.9.0' });
    const result = await skillRefsFreshGate({ repoRoot });

    expect(result.drift).toHaveLength(1);
    const [item] = result.drift;
    expect(item.severity).toBe('major');
    expect(item.actual).toContain('1.0.0');
    expect(item.actual).toContain('0.9.0');
  });

  it('(c2) flags VERSION.json#plugin drifting from the manifest', async () => {
    const repoRoot = await fixture({ pluginVersion: '1.1.0', versionFilePlugin: '1.0.0' });
    const result = await skillRefsFreshGate({ repoRoot });

    expect(result.drift).toHaveLength(1);
    expect(result.drift[0].actual).toContain('VERSION.json (plugin)=1.0.0');
  });

  it('(c3) accepts a plugin version that differs from the kit version', async () => {
    // The whole point of splitting the two chains. A plugin at 1.0.0 built against
    // kit 2.1.1 is the normal state, not drift — the previous single-chain check
    // made this combination impossible to express.
    const repoRoot = await fixture({ pluginVersion: '1.0.0', uiKitVersion: '2.1.1' });
    const result = await skillRefsFreshGate({ repoRoot });

    expect(result.drift).toEqual([]);
  });

  it('(c4) flags a corpus that records the wrong kit version', async () => {
    // The digest says it came from 2.0.0 while the kit is 2.1.1: the references
    // describe an API that is no longer the one shipping.
    const repoRoot = await fixture({ uiKitVersion: '2.1.1', versionFileUiKit: '2.0.0' });
    const result = await skillRefsFreshGate({ repoRoot });

    expect(result.drift).toHaveLength(1);
    const [item] = result.drift;
    expect(item.severity).toBe('major');
    expect(item.expected).toContain('2.1.1');
    expect(item.actual).toContain('2.0.0');
  });

  it('(d) stays silent when pixelate-map.md does not exist yet', async () => {
    const repoRoot = await fixture();
    const result = await skillRefsFreshGate({ repoRoot });

    expect(result.drift.filter((d) => d.artifact.includes('pixelate-map'))).toEqual([]);
  });

  it('(e) flags a pixelate-map component that is not in the registry', async () => {
    const repoRoot = await fixture({
      pixelateMap: [
        '# Pixelate map',
        '',
        '| html | pxlkit |',
        '| --- | --- |',
        '| `<button>` | `PixelButton` |',
        '| `<dialog>` | `PixelNonexistentThing` |',
      ].join('\n'),
    });
    const result = await skillRefsFreshGate({ repoRoot });

    expect(result.drift).toHaveLength(1);
    const [item] = result.drift;
    expect(item.severity).toBe('major');
    expect(item.artifact).toContain('pixelate-map.md');
    expect(item.actual).toContain('PixelNonexistentThing');
  });
});
