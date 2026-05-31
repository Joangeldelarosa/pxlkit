/**
 * Tests for Gate 01 — coverage-components.
 *
 * Strategy: build a minimal ui-kit fixture inside the OS tmpdir
 *   packages/ui-kit/src/
 *     index.tsx          — emits the exports we want to assert against
 *     registry.ts        — UI_KIT_COMPONENTS tuple
 *     cards/PixelFeatureCard.tsx
 *     cards/PixelFeatureCard.manifest.ts        (sometimes)
 *     cards/PixelFeatureCard.examples.tsx       (sometimes)
 *     __tests__/cards/PixelFeatureCard.test.tsx (sometimes)
 *     inputs.tsx                                 — grouped barrel
 *     __tests__/inputs.test.tsx                  — grouped test
 *
 * For each scenario we build a mocked AuditContext that points at the fixture,
 * run the gate, then inspect the findings.
 */

import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CoverageComponentsGate } from '../../gates/01-coverage-components.js';
import type { AuditContext } from '../../_lib/load-context.js';

let FIXTURE_ROOT: string;

function ctxFor(repoRoot: string): AuditContext {
  const uiKitSrcDir = path.join(repoRoot, 'packages/ui-kit/src');
  return {
    repoRoot,
    manifests: [],
    uiKitSrcDir,
    appsWebSrcDir: path.join(repoRoot, 'apps/web/src'),
    tokensFile: path.join(uiKitSrcDir, 'tokens.ts'),
    registryFile: path.join(uiKitSrcDir, 'registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [],
    logger: {
      info: () => undefined,
      warn: () => undefined,
      error: () => undefined,
      debug: () => undefined,
    },
  };
}

async function writeRegistry(repoRoot: string, names: string[]): Promise<void> {
  const file = path.join(repoRoot, 'packages/ui-kit/src/registry.ts');
  const body = `export const UI_KIT_COMPONENTS = [\n${names.map((n) => `  '${n}',`).join('\n')}\n] as const;\n`;
  await fs.outputFile(file, body, 'utf8');
}

async function writeIndex(repoRoot: string, exports: string[]): Promise<void> {
  const file = path.join(repoRoot, 'packages/ui-kit/src/index.tsx');
  const body = exports.map((e) => `export * from '${e}';`).join('\n') + '\n';
  await fs.outputFile(file, body, 'utf8');
}

async function writeComponentFile(repoRoot: string, rel: string, component: string): Promise<void> {
  const file = path.join(repoRoot, 'packages/ui-kit/src', rel);
  await fs.outputFile(file, `export const ${component} = () => null;\n`, 'utf8');
}

async function writeGroupedFile(
  repoRoot: string,
  rel: string,
  components: string[],
): Promise<void> {
  const file = path.join(repoRoot, 'packages/ui-kit/src', rel);
  const body = components.map((c) => `export const ${c} = () => null;`).join('\n') + '\n';
  await fs.outputFile(file, body, 'utf8');
}

async function touch(file: string): Promise<void> {
  await fs.outputFile(file, 'export {};\n', 'utf8');
}

beforeEach(async () => {
  FIXTURE_ROOT = path.join(
    os.tmpdir(),
    `pxlkit-coverage-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  await fs.ensureDir(FIXTURE_ROOT);
});

afterEach(async () => {
  await fs.remove(FIXTURE_ROOT).catch(() => undefined);
});

describe('CoverageComponentsGate', () => {
  it('passes when every registered component has manifest + examples + test', async () => {
    await writeRegistry(FIXTURE_ROOT, ['PixelFeatureCard']);
    await writeIndex(FIXTURE_ROOT, ['./cards/PixelFeatureCard']);
    await writeComponentFile(FIXTURE_ROOT, 'cards/PixelFeatureCard.tsx', 'PixelFeatureCard');
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/cards/PixelFeatureCard.manifest.ts'));
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/cards/PixelFeatureCard.examples.tsx'));
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/__tests__/cards/PixelFeatureCard.test.tsx'));

    const gate = new CoverageComponentsGate();
    const result = await gate.run(ctxFor(FIXTURE_ROOT));

    expect(result.name).toBe('coverage-components');
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('flags a missing manifest as a blocker', async () => {
    await writeRegistry(FIXTURE_ROOT, ['PixelFeatureCard']);
    await writeIndex(FIXTURE_ROOT, ['./cards/PixelFeatureCard']);
    await writeComponentFile(FIXTURE_ROOT, 'cards/PixelFeatureCard.tsx', 'PixelFeatureCard');
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/cards/PixelFeatureCard.examples.tsx'));
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/__tests__/cards/PixelFeatureCard.test.tsx'));

    const gate = new CoverageComponentsGate();
    const result = await gate.run(ctxFor(FIXTURE_ROOT));

    expect(result.passed).toBe(false);
    const missingManifest = result.findings.find(
      (f) => f.component === 'PixelFeatureCard' && f.message.includes('Missing manifest'),
    );
    expect(missingManifest).toBeDefined();
    expect(missingManifest?.severity).toBe('blocker');
    expect(missingManifest?.file).toContain('PixelFeatureCard.manifest.ts');
    expect(missingManifest?.suggestion).toContain('defineManifest');
  });

  it('flags missing examples and tests as major', async () => {
    await writeRegistry(FIXTURE_ROOT, ['PixelFeatureCard']);
    await writeIndex(FIXTURE_ROOT, ['./cards/PixelFeatureCard']);
    await writeComponentFile(FIXTURE_ROOT, 'cards/PixelFeatureCard.tsx', 'PixelFeatureCard');
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/cards/PixelFeatureCard.manifest.ts'));

    const gate = new CoverageComponentsGate();
    const result = await gate.run(ctxFor(FIXTURE_ROOT));

    expect(result.passed).toBe(false);
    const severities = result.findings
      .filter((f) => f.component === 'PixelFeatureCard')
      .map((f) => f.severity);
    expect(severities).toContain('major');
    expect(severities.filter((s) => s === 'major').length).toBeGreaterThanOrEqual(2);
    expect(result.findings.every((f) => f.severity !== 'blocker' || !f.message.includes('Missing manifest'))).toBe(
      true,
    );
  });

  it('honors a co-located test file alongside the source', async () => {
    await writeRegistry(FIXTURE_ROOT, ['PixelFeatureCard']);
    await writeIndex(FIXTURE_ROOT, ['./cards/PixelFeatureCard']);
    await writeComponentFile(FIXTURE_ROOT, 'cards/PixelFeatureCard.tsx', 'PixelFeatureCard');
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/cards/PixelFeatureCard.manifest.ts'));
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/cards/PixelFeatureCard.examples.tsx'));
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/cards/PixelFeatureCard.test.tsx'));

    const gate = new CoverageComponentsGate();
    const result = await gate.run(ctxFor(FIXTURE_ROOT));

    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  it('accepts a grouped test file for components in a grouped barrel', async () => {
    await writeRegistry(FIXTURE_ROOT, ['PixelInput', 'PixelPasswordInput']);
    await writeIndex(FIXTURE_ROOT, ['./inputs']);
    await writeGroupedFile(FIXTURE_ROOT, 'inputs.tsx', ['PixelInput', 'PixelPasswordInput']);
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/PixelInput.manifest.ts'));
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/PixelInput.examples.tsx'));
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/PixelPasswordInput.manifest.ts'));
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/PixelPasswordInput.examples.tsx'));
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/__tests__/inputs.test.tsx'));

    const gate = new CoverageComponentsGate();
    const result = await gate.run(ctxFor(FIXTURE_ROOT));

    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  it('reports a blocker when a registered component has no matching export at all', async () => {
    await writeRegistry(FIXTURE_ROOT, ['PixelFeatureCard', 'PixelGhost']);
    await writeIndex(FIXTURE_ROOT, ['./cards/PixelFeatureCard']);
    await writeComponentFile(FIXTURE_ROOT, 'cards/PixelFeatureCard.tsx', 'PixelFeatureCard');
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/cards/PixelFeatureCard.manifest.ts'));
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/cards/PixelFeatureCard.examples.tsx'));
    await touch(path.join(FIXTURE_ROOT, 'packages/ui-kit/src/__tests__/cards/PixelFeatureCard.test.tsx'));

    const gate = new CoverageComponentsGate();
    const result = await gate.run(ctxFor(FIXTURE_ROOT));

    expect(result.passed).toBe(false);
    const ghost = result.findings.find((f) => f.component === 'PixelGhost');
    expect(ghost).toBeDefined();
    expect(ghost?.severity).toBe('blocker');
    expect(ghost?.message).toContain('no matching export');
  });

  it('returns a blocker finding when index.tsx is missing', async () => {
    await writeRegistry(FIXTURE_ROOT, ['PixelFeatureCard']);

    const gate = new CoverageComponentsGate();
    const result = await gate.run(ctxFor(FIXTURE_ROOT));

    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('blocker');
    expect(result.findings[0].message).toContain('index.tsx not found');
  });

  it('returns a blocker finding when registry.ts is missing', async () => {
    await writeIndex(FIXTURE_ROOT, ['./cards/PixelFeatureCard']);
    await writeComponentFile(FIXTURE_ROOT, 'cards/PixelFeatureCard.tsx', 'PixelFeatureCard');

    const gate = new CoverageComponentsGate();
    const result = await gate.run(ctxFor(FIXTURE_ROOT));

    expect(result.passed).toBe(false);
    expect(result.findings[0].severity).toBe('blocker');
    expect(result.findings[0].message).toContain('registry.ts not found');
  });

  it('returns a blocker when UI_KIT_COMPONENTS parses to empty', async () => {
    const registry = path.join(FIXTURE_ROOT, 'packages/ui-kit/src/registry.ts');
    await fs.outputFile(registry, `export const UI_KIT_COMPONENTS = [] as const;\n`, 'utf8');
    await writeIndex(FIXTURE_ROOT, []);

    const gate = new CoverageComponentsGate();
    const result = await gate.run(ctxFor(FIXTURE_ROOT));

    expect(result.passed).toBe(false);
    expect(result.findings[0].severity).toBe('blocker');
    expect(result.findings[0].message).toContain('UI_KIT_COMPONENTS');
  });

  it('exposes gate metadata expected by the audit runner', async () => {
    const gate = new CoverageComponentsGate();
    expect(gate.id).toBe(1);
    expect(gate.name).toBe('coverage-components');
    expect(gate.description.length).toBeGreaterThan(20);
  });
});
