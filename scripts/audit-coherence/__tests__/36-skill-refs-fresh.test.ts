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
    registry: REGISTRY_TS,
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
  uiKitVersion?: string;
  pluginVersion?: string;
  marketplaceVersion?: string;
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
  await writeFile(join(root, 'packages/ui-kit/src/tokens.ts'), TOKENS_TS);
  await writeFile(join(root, 'packages/ui-kit/src/common.tsx'), COMMON_TSX);
  await writeFile(join(root, 'packages/ui-kit/src/index.tsx'), INDEX_TSX);
  await writeFile(join(root, 'packages/ui-kit/styles.css'), STYLES_CSS);
  await writeFile(join(root, 'packages/core/src/types.ts'), CORE_TYPES_TS);

  const uiKit = opts.uiKitVersion ?? '2.1.1';
  await writeFile(
    join(root, 'plugins/pxlkit/references/VERSION.json'),
    `${JSON.stringify(
      {
        uiKit,
        date: '2026-08-08',
        digestHash: opts.digestHash ?? expectedDigest(),
      },
      null,
      2,
    )}\n`,
  );

  await writeFile(
    join(root, 'plugins/pxlkit/.claude-plugin/plugin.json'),
    `${JSON.stringify({ name: 'pxlkit', version: opts.pluginVersion ?? '2.1.1' }, null, 2)}\n`,
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
            version: opts.marketplaceVersion ?? '2.1.1',
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

  it('(c) flags a plugin.json version that lags the ui-kit version', async () => {
    const repoRoot = await fixture({ pluginVersion: '2.1.0' });
    const result = await skillRefsFreshGate({ repoRoot });

    expect(result.drift).toHaveLength(1);
    const [item] = result.drift;
    expect(item.severity).toBe('major');
    expect(item.actual).toContain('2.1.0');
    expect(item.actual).toContain('2.1.1');
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
