import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { CoverageDocsGate } from '../../gates/05-coverage-docs.js';
import type {
  AuditContext,
  Logger,
  ManifestRecord,
} from '../../_lib/load-context.js';

const ROOT = path.join(
  os.tmpdir(),
  `pxlkit-coverage-docs-${process.pid}-${Date.now()}`,
);

const silentLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

function makeCtx(
  repoRoot: string,
  manifests: ManifestRecord[],
): AuditContext {
  return {
    repoRoot,
    manifests,
    uiKitSrcDir: path.join(repoRoot, 'packages/ui-kit/src'),
    appsWebSrcDir: path.join(repoRoot, 'apps/web/src'),
    tokensFile: path.join(repoRoot, 'packages/ui-kit/src/tokens.ts'),
    registryFile: path.join(repoRoot, 'packages/ui-kit/src/registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [],
    logger: silentLogger,
  };
}

async function writeDocsPage(repoRoot: string, body: string): Promise<string> {
  const docsDir = path.join(repoRoot, 'apps/web/src/app/docs');
  await fs.ensureDir(docsDir);
  const file = path.join(docsDir, 'page.tsx');
  await fs.writeFile(file, body, 'utf8');
  return file;
}

beforeAll(async () => {
  await fs.ensureDir(ROOT);
});

afterAll(async () => {
  await fs.remove(ROOT);
});

describe('CoverageDocsGate', () => {
  it('has the expected static metadata', () => {
    const gate = new CoverageDocsGate();
    expect(gate.id).toBe(5);
    expect(gate.name).toBe('coverage-docs');
    expect(gate.description).toMatch(/section with id=<kebab-component-name>/);
  });

  it('passes when every registered component has a matching Section id', async () => {
    const repoRoot = path.join(ROOT, 'pass-case');
    await fs.ensureDir(repoRoot);
    await writeDocsPage(
      repoRoot,
      [
        `<Section id="pixel-button" title="Pixel Button">…</Section>`,
        `<Section id="pixel-card" title="Pixel Card">…</Section>`,
        `<Section id="pixel-toast" title="Pixel Toast">…</Section>`,
      ].join('\n'),
    );

    const ctx = makeCtx(repoRoot, [
      { component: 'PixelButton', source: 'manifest.ts' },
      { component: 'PixelCard', source: 'manifest.ts' },
      { component: 'PixelToast', source: 'manifest.ts' },
    ]);

    const gate = new CoverageDocsGate();
    const result = await gate.run(ctx);

    expect(result.name).toBe('coverage-docs');
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('flags components missing their Section id as major findings', async () => {
    const repoRoot = path.join(ROOT, 'fail-case');
    await fs.ensureDir(repoRoot);
    const docsFile = await writeDocsPage(
      repoRoot,
      `<Section id="pixel-button" title="Pixel Button">…</Section>`,
    );

    const ctx = makeCtx(repoRoot, [
      { component: 'PixelButton', source: 'manifest.ts' },
      { component: 'PixelCard', source: 'manifest.ts' },
      { component: 'PixelToastGroup', source: 'manifest.ts' },
    ]);

    const gate = new CoverageDocsGate();
    const result = await gate.run(ctx);

    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(2);

    const missing = result.findings.map((f) => f.component).sort();
    expect(missing).toEqual(['PixelCard', 'PixelToastGroup']);

    for (const finding of result.findings) {
      expect(finding.severity).toBe('major');
      expect(finding.file).toBe(
        path.relative(repoRoot, docsFile) || docsFile,
      );
      expect(finding.message).toMatch(/missing a section/);
      expect(finding.suggestion).toMatch(/<Section id="/);
    }

    const card = result.findings.find((f) => f.component === 'PixelCard');
    expect(card?.message).toContain('pixel-card');
    const toast = result.findings.find(
      (f) => f.component === 'PixelToastGroup',
    );
    expect(toast?.message).toContain('pixel-toast-group');
  });

  it('returns a major finding when the docs page does not exist', async () => {
    const repoRoot = path.join(ROOT, 'missing-page');
    await fs.ensureDir(repoRoot);

    const ctx = makeCtx(repoRoot, [
      { component: 'PixelButton', source: 'manifest.ts' },
    ]);

    const gate = new CoverageDocsGate();
    const result = await gate.run(ctx);

    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.severity).toBe('major');
    expect(result.findings[0]?.message).toMatch(/docs page not found/);
  });

  it('passes (no-op) when no components are registered in manifests', async () => {
    const repoRoot = path.join(ROOT, 'no-manifests');
    await fs.ensureDir(repoRoot);
    await writeDocsPage(repoRoot, `<Section id="getting-started" />`);

    const ctx = makeCtx(repoRoot, []);

    const gate = new CoverageDocsGate();
    const result = await gate.run(ctx);

    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('deduplicates components that appear in multiple manifest entries', async () => {
    const repoRoot = path.join(ROOT, 'dedup');
    await fs.ensureDir(repoRoot);
    await writeDocsPage(repoRoot, `<Section id="other" />`);

    const ctx = makeCtx(repoRoot, [
      { component: 'PixelButton', source: 'a.ts' },
      { component: 'PixelButton', source: 'b.ts' },
    ]);

    const gate = new CoverageDocsGate();
    const result = await gate.run(ctx);

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.component).toBe('PixelButton');
  });

  it('honours custom docsPagePath override', async () => {
    const repoRoot = path.join(ROOT, 'custom-path');
    await fs.ensureDir(repoRoot);
    const altDir = path.join(repoRoot, 'alt');
    await fs.ensureDir(altDir);
    const altFile = path.join(altDir, 'docs.tsx');
    await fs.writeFile(altFile, `<Section id="pixel-button" />`, 'utf8');

    const ctx = makeCtx(repoRoot, [
      { component: 'PixelButton', source: 'manifest.ts' },
    ]);

    const gate = new CoverageDocsGate({ docsPagePath: altFile });
    const result = await gate.run(ctx);

    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('falls back to any id attribute when no <Section> tags are present', async () => {
    const repoRoot = path.join(ROOT, 'plain-id');
    await fs.ensureDir(repoRoot);
    await writeDocsPage(
      repoRoot,
      `<section id="pixel-button">body</section>`,
    );

    const ctx = makeCtx(repoRoot, [
      { component: 'PixelButton', source: 'manifest.ts' },
    ]);

    const gate = new CoverageDocsGate();
    const result = await gate.run(ctx);

    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });
});
