/**
 * Tests for scripts/audit-coherence/gates/04-coverage-showcase.ts
 *
 * Strategy: write a synthetic showcase page to a tmpdir, build a minimal
 * AuditContext that points at it, then assert how the gate reacts to:
 *  - all anchors present → passed:true, no findings
 *  - some anchors missing → passed:false, one finding per missing component
 *  - the showcase page file is missing → passed:false, single major finding
 *  - empty manifests → passed:true (nothing to check)
 *  - manifests with empty component names → skipped gracefully
 *  - duplicate manifest entries → reported only once
 */

import path from 'node:path';
import os from 'node:os';
import fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  CoverageShowcaseGate,
  anchorIdFor,
  extractAnchorIds,
  showcasePagePath,
} from '../../gates/04-coverage-showcase';
import type { AuditContext, ManifestRecord } from '../../_lib/load-context';

interface BuildCtxOptions {
  pageSource: string | null;
  manifests: ManifestRecord[];
}

async function buildContext(opts: BuildCtxOptions): Promise<{
  ctx: AuditContext;
  cleanup: () => Promise<void>;
  pageFile: string;
}> {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'audit-coverage-'));
  const repoRoot = path.join(tmp, 'repo');
  const appsWebSrcDir = path.join(repoRoot, 'apps', 'web', 'src');
  const uiKitSrcDir = path.join(repoRoot, 'packages', 'ui-kit', 'src');
  const pageDir = path.join(appsWebSrcDir, 'app', 'ui-kit');
  await fs.ensureDir(pageDir);
  await fs.ensureDir(uiKitSrcDir);
  const pageFile = path.join(pageDir, 'page.tsx');
  if (opts.pageSource !== null) {
    await fs.writeFile(pageFile, opts.pageSource, 'utf8');
  }

  const ctx: AuditContext = {
    repoRoot,
    manifests: opts.manifests,
    uiKitSrcDir,
    appsWebSrcDir,
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

  return {
    ctx,
    pageFile,
    cleanup: () => fs.remove(tmp),
  };
}

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  while (cleanups.length > 0) {
    const fn = cleanups.pop();
    if (fn) await fn();
  }
});

describe('extractAnchorIds', () => {
  it('finds kebab id values inside JSX-ish source', () => {
    const src = `
      <section id="pixel-button" />
      <div id="pixel-input"></div>
      <span id="not_kebab"></span>
      <article id="UPPER"></article>
      <p id="pixel-select"/>
    `;
    const ids = extractAnchorIds(src);
    expect(ids.has('pixel-button')).toBe(true);
    expect(ids.has('pixel-input')).toBe(true);
    expect(ids.has('pixel-select')).toBe(true);
    expect(ids.has('not_kebab')).toBe(false);
    expect(ids.has('upper')).toBe(false);
  });

  it('returns an empty set when there are no ids', () => {
    expect(extractAnchorIds('<div className="x" />').size).toBe(0);
  });
});

describe('anchorIdFor', () => {
  it('converts PascalCase to kebab-case', () => {
    expect(anchorIdFor('PixelButton')).toBe('pixel-button');
    expect(anchorIdFor('PxlKitButton')).toBe('pxl-kit-button');
  });
  it('returns empty string for empty input', () => {
    expect(anchorIdFor('')).toBe('');
    expect(anchorIdFor('   ')).toBe('');
  });
});

describe('CoverageShowcaseGate.run', () => {
  it('passes when every manifest component has a kebab anchor id', async () => {
    const page = `
      'use client';
      export default function Page() {
        return (<>
          <section id="pixel-button" />
          <section id="pixel-input" />
          <div id="pixel-select" />
        </>);
      }
    `;
    const { ctx, cleanup } = await buildContext({
      pageSource: page,
      manifests: [
        { component: 'PixelButton' },
        { component: 'PixelInput' },
        { component: 'PixelSelect' },
      ],
    });
    cleanups.push(cleanup);

    const gate = new CoverageShowcaseGate();
    const result = await gate.run(ctx);

    expect(gate.id).toBe(4);
    expect(gate.name).toBe('coverage-showcase');
    expect(result.name).toBe('coverage-showcase');
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('flags every component without a matching anchor id as major', async () => {
    const page = `
      <section id="pixel-button" />
    `;
    const { ctx, cleanup, pageFile } = await buildContext({
      pageSource: page,
      manifests: [
        { component: 'PixelButton' },
        { component: 'PixelInput' },
        { component: 'PixelSelect' },
      ],
    });
    cleanups.push(cleanup);

    const result = await new CoverageShowcaseGate().run(ctx);

    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(2);
    const components = result.findings.map((f) => f.component).sort();
    expect(components).toEqual(['PixelInput', 'PixelSelect']);
    for (const finding of result.findings) {
      expect(finding.severity).toBe('major');
      expect(finding.file).toBe(pageFile);
      expect(finding.message).toMatch(/missing anchor id/);
      expect(finding.suggestion).toMatch(/apps\/web\/src\/app\/ui-kit\/page\.tsx/);
    }
  });

  it('returns a single major finding when the showcase page is missing', async () => {
    const { ctx, cleanup, pageFile } = await buildContext({
      pageSource: null,
      manifests: [{ component: 'PixelButton' }],
    });
    cleanups.push(cleanup);

    const result = await new CoverageShowcaseGate().run(ctx);

    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('major');
    expect(result.findings[0].file).toBe(pageFile);
    expect(result.findings[0].message).toMatch(/showcase page not found/);
  });

  it('passes when manifests are empty (nothing to verify)', async () => {
    const { ctx, cleanup } = await buildContext({
      pageSource: '<section />',
      manifests: [],
    });
    cleanups.push(cleanup);

    const result = await new CoverageShowcaseGate().run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('ignores manifests whose component name is empty / whitespace', async () => {
    const page = '<section id="pixel-button" />';
    const { ctx, cleanup } = await buildContext({
      pageSource: page,
      manifests: [
        { component: 'PixelButton' },
        { component: '   ' },
        { component: '' },
      ],
    });
    cleanups.push(cleanup);

    const result = await new CoverageShowcaseGate().run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('reports duplicates only once', async () => {
    const page = '<section id="pixel-button" />';
    const { ctx, cleanup } = await buildContext({
      pageSource: page,
      manifests: [
        { component: 'PixelInput' },
        { component: 'PixelInput' },
        { component: 'PixelInput' },
      ],
    });
    cleanups.push(cleanup);

    const result = await new CoverageShowcaseGate().run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].component).toBe('PixelInput');
  });

  it('exposes the resolved showcase page path', async () => {
    const { ctx, cleanup, pageFile } = await buildContext({
      pageSource: '',
      manifests: [],
    });
    cleanups.push(cleanup);
    expect(showcasePagePath(ctx)).toBe(pageFile);
  });
});
