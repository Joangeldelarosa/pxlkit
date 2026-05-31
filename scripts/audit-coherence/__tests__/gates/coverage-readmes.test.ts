/**
 * Unit tests for the coverage-readmes gate.
 *
 * Strategy: build a synthetic AuditContext rooted at a temp directory, write
 * fake README.md / registry.ts files, and exercise the gate's run() through
 * the programmatic API. We never touch the real monorepo.
 */

import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  CoverageReadmesGate,
  extractComponentsBlock,
  extractReadmeNames,
  parseRegistrySource,
} from '../../gates/02-coverage-readmes.js';
import type {
  AuditContext,
  Logger,
  PackageFileRef,
} from '../../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function silentLogger(): Logger {
  return {
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined,
    debug: () => undefined,
  };
}

async function makeTempRepo(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'pxl-cov-readmes-'));
}

interface PkgOpts {
  pkgName: string;
  dirName: string;
  readme?: string;
  registry?: string;
}

async function makePkg(repoRoot: string, opts: PkgOpts): Promise<{
  pkgRef: PackageFileRef;
  readmeRef: PackageFileRef | null;
}> {
  const pkgDir = path.join(repoRoot, 'packages', opts.dirName);
  await fs.ensureDir(path.join(pkgDir, 'src'));
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  await fs.writeJson(pkgJsonPath, { name: opts.pkgName, version: '0.0.0' });

  let readmeRef: PackageFileRef | null = null;
  if (typeof opts.readme === 'string') {
    const readmePath = path.join(pkgDir, 'README.md');
    await fs.writeFile(readmePath, opts.readme, 'utf8');
    readmeRef = { package: opts.pkgName, path: readmePath };
  }

  if (typeof opts.registry === 'string') {
    await fs.writeFile(
      path.join(pkgDir, 'src', 'registry.ts'),
      opts.registry,
      'utf8',
    );
  }

  return {
    pkgRef: { package: opts.pkgName, path: pkgJsonPath },
    readmeRef,
  };
}

function makeCtx(
  repoRoot: string,
  pkgs: PackageFileRef[],
  readmes: PackageFileRef[],
): AuditContext {
  return {
    repoRoot,
    manifests: [],
    uiKitSrcDir: path.join(repoRoot, 'packages/ui-kit/src'),
    appsWebSrcDir: path.join(repoRoot, 'apps/web/src'),
    tokensFile: path.join(repoRoot, 'packages/ui-kit/src/tokens.ts'),
    registryFile: path.join(repoRoot, 'packages/ui-kit/src/registry.ts'),
    readmeFiles: readmes,
    changelogFiles: [],
    packageJsons: pkgs,
    logger: silentLogger(),
  };
}

// ---------------------------------------------------------------------------
// Helper-function tests
// ---------------------------------------------------------------------------

describe('parseRegistrySource', () => {
  it('extracts names from a *_COMPONENTS array', () => {
    const source = `
      export const UI_KIT_COMPONENTS = [
        'PixelButton',
        "PixelCard",
        'PxlKitToast',
      ] as const;
    `;
    const result = parseRegistrySource(source);
    expect(result.found).toBe(true);
    expect(result.names).toEqual(['PixelButton', 'PixelCard', 'PxlKitToast']);
    expect(result.errors).toEqual([]);
  });

  it('flags registries with no *_COMPONENTS array', () => {
    const result = parseRegistrySource(`export const FOO = ['bar'];`);
    expect(result.found).toBe(false);
    expect(result.names).toEqual([]);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('handles multi-line and trailing-comma arrays', () => {
    const source = `
      export const EFFECTS_COMPONENTS = [
        'PixelFlame',
        'PixelGlow',
      ];
    `;
    const result = parseRegistrySource(source);
    expect(result.names).toEqual(['PixelFlame', 'PixelGlow']);
  });

  it('merges multiple *_COMPONENTS exports', () => {
    const source = `
      export const A_COMPONENTS = ['PixelA'] as const;
      export const B_COMPONENTS = ['PixelB'] as const;
    `;
    const result = parseRegistrySource(source);
    expect(result.names).toEqual(['PixelA', 'PixelB']);
  });
});

describe('extractComponentsBlock', () => {
  it('returns the body between markers', () => {
    const readme = `# Hello\n<!-- COMPONENTS:START -->\n- A\n- B\n<!-- COMPONENTS:END -->\nDone.`;
    const block = extractComponentsBlock(readme);
    expect(block.hasStart).toBe(true);
    expect(block.hasEnd).toBe(true);
    expect(block.body).toContain('- A');
    expect(block.body).toContain('- B');
  });

  it('reports missing markers', () => {
    const block = extractComponentsBlock('# Hello no markers here');
    expect(block.hasStart).toBe(false);
    expect(block.hasEnd).toBe(false);
    expect(block.body).toBe('');
  });

  it('reports missing END marker', () => {
    const block = extractComponentsBlock('a <!-- COMPONENTS:START --> b');
    expect(block.hasStart).toBe(true);
    expect(block.hasEnd).toBe(false);
  });
});

describe('extractReadmeNames', () => {
  it('finds backticked names and PascalCase tokens', () => {
    const body = '| `PixelButton` | Primary action |\n- PixelCard renders content.';
    const names = extractReadmeNames(body);
    expect(names).toContain('PixelButton');
    expect(names).toContain('PixelCard');
  });

  it('ignores short tokens', () => {
    const names = extractReadmeNames('AB CD `X`');
    expect(names).not.toContain('X');
  });
});

// ---------------------------------------------------------------------------
// Gate behavioural tests
// ---------------------------------------------------------------------------

describe('CoverageReadmesGate', () => {
  let repoRoot: string;
  beforeEach(async () => {
    repoRoot = await makeTempRepo();
  });
  afterEach(async () => {
    await fs.remove(repoRoot);
  });

  it('passes when README has matching components block', async () => {
    const { pkgRef, readmeRef } = await makePkg(repoRoot, {
      pkgName: '@pxlkit/ui-kit',
      dirName: 'ui-kit',
      registry: `export const UI_KIT_COMPONENTS = ['PixelButton', 'PixelCard'] as const;`,
      readme: [
        '# @pxlkit/ui-kit',
        '<!-- COMPONENTS:START -->',
        '- `PixelButton` — primary action',
        '- `PixelCard` — container',
        '<!-- COMPONENTS:END -->',
      ].join('\n'),
    });
    const ctx = makeCtx(repoRoot, [pkgRef], readmeRef ? [readmeRef] : []);
    const gate = new CoverageReadmesGate();
    const result = await gate.run(ctx);
    expect(result.name).toBe('coverage-readmes');
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('reports missing README as major', async () => {
    const { pkgRef } = await makePkg(repoRoot, {
      pkgName: '@pxlkit/feedback',
      dirName: 'feedback',
    });
    const ctx = makeCtx(repoRoot, [pkgRef], []);
    const gate = new CoverageReadmesGate();
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('major');
    expect(result.findings[0].message).toContain('no README.md');
    expect(result.findings[0].component).toBe('@pxlkit/feedback');
  });

  it('reports missing START marker as major when registry exists', async () => {
    const { pkgRef, readmeRef } = await makePkg(repoRoot, {
      pkgName: '@pxlkit/effects',
      dirName: 'effects',
      registry: `export const EFFECTS_COMPONENTS = ['PixelFlame'] as const;`,
      readme: '# effects\n\nNo markers here.',
    });
    const ctx = makeCtx(repoRoot, [pkgRef], readmeRef ? [readmeRef] : []);
    const gate = new CoverageReadmesGate();
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    const messages = result.findings.map((f) => f.message);
    expect(messages.some((m) => m.includes('COMPONENTS:START'))).toBe(true);
    expect(result.findings.every((f) => f.severity === 'major')).toBe(true);
  });

  it('reports missing END marker as major', async () => {
    const { pkgRef, readmeRef } = await makePkg(repoRoot, {
      pkgName: '@pxlkit/effects',
      dirName: 'effects',
      registry: `export const EFFECTS_COMPONENTS = ['PixelFlame'] as const;`,
      readme: '# effects\n<!-- COMPONENTS:START -->\nbody only',
    });
    const ctx = makeCtx(repoRoot, [pkgRef], readmeRef ? [readmeRef] : []);
    const gate = new CoverageReadmesGate();
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    const msgs = result.findings.map((f) => f.message);
    expect(msgs.some((m) => m.includes('COMPONENTS:END'))).toBe(true);
  });

  it('reports registry components missing from README', async () => {
    const { pkgRef, readmeRef } = await makePkg(repoRoot, {
      pkgName: '@pxlkit/ui-kit',
      dirName: 'ui-kit',
      registry: `export const UI_KIT_COMPONENTS = ['PixelButton', 'PixelCard', 'PixelToast'] as const;`,
      readme: [
        '# ui-kit',
        '<!-- COMPONENTS:START -->',
        '- `PixelButton`',
        '<!-- COMPONENTS:END -->',
      ].join('\n'),
    });
    const ctx = makeCtx(repoRoot, [pkgRef], readmeRef ? [readmeRef] : []);
    const gate = new CoverageReadmesGate();
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    const missing = result.findings
      .filter((f) => f.message.includes('missing from README'))
      .map((f) => f.component);
    expect(missing).toContain('PixelCard');
    expect(missing).toContain('PixelToast');
    expect(result.findings.every((f) => f.severity === 'major')).toBe(true);
  });

  it('reports README components not in registry as major', async () => {
    const { pkgRef, readmeRef } = await makePkg(repoRoot, {
      pkgName: '@pxlkit/ui-kit',
      dirName: 'ui-kit',
      registry: `export const UI_KIT_COMPONENTS = ['PixelButton'] as const;`,
      readme: [
        '# ui-kit',
        '<!-- COMPONENTS:START -->',
        '- `PixelButton`',
        '- `PixelGhost`',
        '<!-- COMPONENTS:END -->',
      ].join('\n'),
    });
    const ctx = makeCtx(repoRoot, [pkgRef], readmeRef ? [readmeRef] : []);
    const gate = new CoverageReadmesGate();
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    const extras = result.findings.filter((f) =>
      f.message.includes('not in the registry'),
    );
    expect(extras.length).toBe(1);
    expect(extras[0].component).toBe('PixelGhost');
  });

  it('passes packages with README but without registry (nothing to match)', async () => {
    const { pkgRef, readmeRef } = await makePkg(repoRoot, {
      pkgName: '@pxlkit/core',
      dirName: 'core',
      readme: '# core\nNo components here.',
    });
    const ctx = makeCtx(repoRoot, [pkgRef], readmeRef ? [readmeRef] : []);
    const gate = new CoverageReadmesGate();
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('fails fast when no packages are discovered', async () => {
    const ctx = makeCtx(repoRoot, [], []);
    const gate = new CoverageReadmesGate();
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].message).toContain('no packages discovered');
  });

  it('reports empty block when registry has entries', async () => {
    const { pkgRef, readmeRef } = await makePkg(repoRoot, {
      pkgName: '@pxlkit/ui-kit',
      dirName: 'ui-kit',
      registry: `export const UI_KIT_COMPONENTS = ['PixelButton'] as const;`,
      readme: [
        '# ui-kit',
        '<!-- COMPONENTS:START -->',
        '',
        '<!-- COMPONENTS:END -->',
      ].join('\n'),
    });
    const ctx = makeCtx(repoRoot, [pkgRef], readmeRef ? [readmeRef] : []);
    const gate = new CoverageReadmesGate();
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(
      result.findings.some((f) => f.message.includes('components block is empty')),
    ).toBe(true);
  });

  it('reports registry without *_COMPONENTS as major', async () => {
    const { pkgRef, readmeRef } = await makePkg(repoRoot, {
      pkgName: '@pxlkit/ui-kit',
      dirName: 'ui-kit',
      registry: `export const STUFF = ['PixelButton'];`,
      readme: [
        '# ui-kit',
        '<!-- COMPONENTS:START -->',
        '- `PixelButton`',
        '<!-- COMPONENTS:END -->',
      ].join('\n'),
    });
    const ctx = makeCtx(repoRoot, [pkgRef], readmeRef ? [readmeRef] : []);
    const gate = new CoverageReadmesGate();
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(
      result.findings.some((f) =>
        f.message.includes('no exported *_COMPONENTS'),
      ),
    ).toBe(true);
  });
});
