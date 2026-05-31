import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  evaluate,
  parseRegistryComponents,
  whatsNewStripCoherenceGate,
} from '../../gates/31-whats-new-strip-coherence';

interface Fixture {
  root: string;
}

async function createFixture(opts: {
  stripContent: string | null;
  registryComponents: string[];
  uiKitVersion: string | null;
}): Promise<Fixture> {
  const root = await mkdtemp(join(tmpdir(), 'pxlkit-gate-31-'));

  await mkdir(join(root, 'apps/web/src/components'), { recursive: true });
  await mkdir(join(root, 'packages/ui-kit/src'), { recursive: true });

  if (opts.stripContent !== null) {
    await writeFile(
      join(root, 'apps/web/src/components/whats-new-strip.tsx'),
      opts.stripContent,
    );
  }

  const entries = opts.registryComponents.map((c) => `  '${c}',`).join('\n');
  await writeFile(
    join(root, 'packages/ui-kit/src/registry.ts'),
    `export const UI_KIT_COMPONENTS = [\n${entries}\n] as const;\n`,
  );

  const pkg: Record<string, string> = { name: '@pxlkit/ui-kit' };
  if (opts.uiKitVersion) pkg.version = opts.uiKitVersion;
  await writeFile(
    join(root, 'packages/ui-kit/package.json'),
    JSON.stringify(pkg),
  );

  return { root };
}

describe('gate 31: whats-new-strip coherence', () => {
  const fixtures: Fixture[] = [];

  afterAll(async () => {
    for (const f of fixtures) {
      await rm(f.root, { recursive: true, force: true });
    }
  });

  it('passes when strip exists, references a current registry component, and pins the current version', async () => {
    const f = await createFixture({
      stripContent: `
        import { PixelCard, PixelBadge } from '@pxlkit/ui-kit';
        export default function WhatsNewStrip() {
          return <PixelCard title="v1.5.0">new</PixelCard>;
        }
      `,
      registryComponents: ['PixelCard', 'PixelBadge', 'PixelButton'],
      uiKitVersion: '1.5.0',
    });
    fixtures.push(f);

    const result = await whatsNewStripCoherenceGate({ repoRoot: f.root });
    expect(result.drift).toEqual([]);
  });

  it('fails with blocker when whats-new-strip.tsx does not exist', async () => {
    const f = await createFixture({
      stripContent: null,
      registryComponents: ['PixelCard', 'PixelBadge'],
      uiKitVersion: '1.5.0',
    });
    fixtures.push(f);

    const result = await whatsNewStripCoherenceGate({ repoRoot: f.root });

    expect(result.drift.length).toBe(1);
    expect(result.drift[0]?.severity).toBe('blocker');
    expect(result.drift[0]?.artifact).toContain('whats-new-strip.tsx');
  });

  it('fails when strip references no current registry components', async () => {
    const f = await createFixture({
      stripContent: `
        // Only references components that no longer exist
        const stale = ['LegacyWidget', 'OldFoo'];
        export default function Strip() {
          return <div>{stale.join(',')}</div>;
        }
      `,
      registryComponents: ['PixelCard', 'PixelBadge', 'PixelButton'],
      uiKitVersion: '1.5.0',
    });
    fixtures.push(f);

    const result = await whatsNewStripCoherenceGate({ repoRoot: f.root });

    const refDrift = result.drift.find((d) =>
      d.expected.includes('at least one current ui-kit component'),
    );
    expect(refDrift).toBeDefined();
    expect(refDrift?.severity).toBe('blocker');
  });

  it('fails when strip does not mention current version', async () => {
    const f = await createFixture({
      stripContent: `
        import { PixelCard } from '@pxlkit/ui-kit';
        export default function Strip() {
          return <PixelCard title="v1.0.0">old</PixelCard>;
        }
      `,
      registryComponents: ['PixelCard'],
      uiKitVersion: '1.5.0',
    });
    fixtures.push(f);

    const result = await whatsNewStripCoherenceGate({ repoRoot: f.root });

    const versionDrift = result.drift.find((d) => d.expected.includes('1.5.0'));
    expect(versionDrift).toBeDefined();
    expect(versionDrift?.severity).toBe('major');
  });

  it('parseRegistryComponents extracts quoted single-string identifiers', () => {
    const src = `
      export const UI_KIT_COMPONENTS = [
        'PixelCard',
        'PixelBadge',
        'PixelButton',
      ] as const;
    `;
    expect(parseRegistryComponents(src)).toEqual([
      'PixelCard',
      'PixelBadge',
      'PixelButton',
    ]);
  });

  it('evaluate() returns blocker when strip is null even with registry present', () => {
    const drift = evaluate({
      strip: null,
      registry: "export const X = ['PixelCard'];",
      uiKitPackage: { version: '1.5.0' },
    });
    expect(drift.length).toBe(1);
    expect(drift[0]?.severity).toBe('blocker');
  });
});
