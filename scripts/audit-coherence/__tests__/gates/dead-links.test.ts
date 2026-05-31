import fs from 'fs-extra';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  DeadLinksGate,
  extractMarkdownLinks,
  extractMarkdownHeadings,
  extractHtmlIds,
  slugifyHeading,
} from '../../gates/13-dead-links.js';
import type {
  AuditContext,
  Logger,
} from '../../_lib/load-context.js';

const ROOT = path.join(
  os.tmpdir(),
  `pxlkit-dead-links-${process.pid}-${Date.now()}`,
);

const silentLogger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

function makeCtx(repoRoot: string): AuditContext {
  return {
    repoRoot,
    manifests: [],
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

async function writeFile(file: string, body: string): Promise<string> {
  await fs.ensureDir(path.dirname(file));
  await fs.writeFile(file, body, 'utf8');
  return file;
}

beforeAll(async () => {
  await fs.ensureDir(ROOT);
});

afterAll(async () => {
  await fs.remove(ROOT);
});

describe('DeadLinksGate', () => {
  it('has the expected static metadata', () => {
    const gate = new DeadLinksGate();
    expect(gate.id).toBe(13);
    expect(gate.name).toBe('dead-links');
    expect(gate.description).toMatch(/dead-?links|dead link|internal markdown links|Broken|Scan all/i);
  });

  describe('helpers', () => {
    it('slugifyHeading produces github-style slugs', () => {
      expect(slugifyHeading('Hello World')).toBe('hello-world');
      expect(slugifyHeading('  Trim Me  ')).toBe('trim-me');
      expect(slugifyHeading('Pixel Button: Variants & Sizes')).toBe('pixel-button-variants-sizes');
      expect(slugifyHeading('Multi   space')).toBe('multi-space');
    });

    it('extractMarkdownLinks skips external urls', () => {
      const src = [
        '[a](./a.md)',
        '[b](https://example.com)',
        '[c](http://example.com)',
        '[d](mailto:joe@example.com)',
        '[e](#anchor)',
        '[f](./other.md#sec)',
      ].join('\n');
      const links = extractMarkdownLinks(src, '/tmp/x.md');
      const raws = links.map((l) => l.raw).sort();
      expect(raws).toEqual(['#anchor', './a.md', './other.md#sec']);

      const sec = links.find((l) => l.raw === './other.md#sec');
      expect(sec?.target).toBe('./other.md');
      expect(sec?.anchor).toBe('sec');

      const anchorOnly = links.find((l) => l.raw === '#anchor');
      expect(anchorOnly?.target).toBe('');
      expect(anchorOnly?.anchor).toBe('anchor');
    });

    it('extractMarkdownLinks reports line numbers', () => {
      const src = '\n\n[a](./a.md)\n[b](./b.md)';
      const links = extractMarkdownLinks(src, '/tmp/x.md');
      expect(links[0]?.line).toBe(3);
      expect(links[1]?.line).toBe(4);
    });

    it('extractMarkdownHeadings collects slugs and ignores fenced blocks', () => {
      const src = [
        '# Title One',
        '## Sub Section',
        '```ts',
        '# not-a-heading',
        '```',
        '### Third',
      ].join('\n');
      const slugs = extractMarkdownHeadings(src);
      expect(slugs.has('title-one')).toBe(true);
      expect(slugs.has('sub-section')).toBe(true);
      expect(slugs.has('third')).toBe(true);
      expect(slugs.has('not-a-heading')).toBe(false);
    });

    it('extractHtmlIds collects id attributes and named anchors', () => {
      const src = [
        '<section id="alpha">…</section>',
        '<div id="beta">…</div>',
        `<a name="gamma">…</a>`,
      ].join('\n');
      const ids = extractHtmlIds(src);
      expect(ids.has('alpha')).toBe(true);
      expect(ids.has('beta')).toBe(true);
      expect(ids.has('gamma')).toBe(true);
    });
  });

  it('passes when every internal link resolves', async () => {
    const repoRoot = path.join(ROOT, 'pass-case');
    await fs.ensureDir(repoRoot);
    await writeFile(
      path.join(repoRoot, 'README.md'),
      [
        '# Project',
        '',
        'See [docs](./docs/intro.md) and [setup](./docs/intro.md#setup).',
        'Also visit [website](https://example.com).',
      ].join('\n'),
    );
    await writeFile(
      path.join(repoRoot, 'docs/intro.md'),
      ['# Intro', '', '## Setup', '', 'See [back](../README.md).'].join('\n'),
    );

    const gate = new DeadLinksGate({
      patterns: ['README.md', 'docs/**/*.md'],
    });
    const result = await gate.run(makeCtx(repoRoot));

    expect(result.name).toBe('dead-links');
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('flags broken file targets as major', async () => {
    const repoRoot = path.join(ROOT, 'broken-file');
    await fs.ensureDir(repoRoot);
    await writeFile(
      path.join(repoRoot, 'README.md'),
      'Read the [guide](./docs/missing.md).',
    );

    const gate = new DeadLinksGate({ patterns: ['README.md'] });
    const result = await gate.run(makeCtx(repoRoot));

    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    const finding = result.findings[0]!;
    expect(finding.severity).toBe('major');
    expect(finding.file).toBe('README.md');
    expect(finding.message).toMatch(/Broken link target/);
    expect(finding.message).toContain('./docs/missing.md');
    expect(finding.suggestion).toMatch(/Fix the path|create the missing file/i);
  });

  it('flags broken anchors in existing target files as major', async () => {
    const repoRoot = path.join(ROOT, 'broken-anchor');
    await fs.ensureDir(repoRoot);
    await writeFile(
      path.join(repoRoot, 'README.md'),
      'See [setup](./docs/intro.md#install).',
    );
    await writeFile(
      path.join(repoRoot, 'docs/intro.md'),
      ['# Intro', '', '## Setup', ''].join('\n'),
    );

    const gate = new DeadLinksGate({
      patterns: ['README.md', 'docs/**/*.md'],
    });
    const result = await gate.run(makeCtx(repoRoot));

    expect(result.passed).toBe(false);
    const broken = result.findings.find((f) =>
      f.message.includes('#install'),
    );
    expect(broken).toBeTruthy();
    expect(broken?.severity).toBe('major');
    expect(broken?.message).toMatch(/Broken anchor/);
    expect(broken?.suggestion).toMatch(/slug|anchor/);
  });

  it('flags broken same-file anchors as major', async () => {
    const repoRoot = path.join(ROOT, 'same-file-anchor');
    await fs.ensureDir(repoRoot);
    await writeFile(
      path.join(repoRoot, 'README.md'),
      ['# Title', '', '[jump](#ghost)'].join('\n'),
    );

    const gate = new DeadLinksGate({ patterns: ['README.md'] });
    const result = await gate.run(makeCtx(repoRoot));

    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.severity).toBe('major');
    expect(result.findings[0]?.message).toMatch(/#ghost/);
  });

  it('resolves anchors against html ids in .tsx pages', async () => {
    const repoRoot = path.join(ROOT, 'tsx-anchor');
    await fs.ensureDir(repoRoot);
    await writeFile(
      path.join(repoRoot, 'README.md'),
      [
        'See [button](./apps/web/src/app/docs/page.tsx#pixel-button).',
        'See [missing](./apps/web/src/app/docs/page.tsx#nope).',
      ].join('\n'),
    );
    await writeFile(
      path.join(repoRoot, 'apps/web/src/app/docs/page.tsx'),
      `<Section id="pixel-button" title="Pixel Button">...</Section>`,
    );

    const gate = new DeadLinksGate({
      patterns: ['README.md'],
    });
    const result = await gate.run(makeCtx(repoRoot));

    expect(result.passed).toBe(false);
    // Only the missing anchor should fail.
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.message).toContain('#nope');
  });

  it('passes trivially when no source files match', async () => {
    const repoRoot = path.join(ROOT, 'no-sources');
    await fs.ensureDir(repoRoot);

    const gate = new DeadLinksGate({ patterns: ['nonexistent/**/*.md'] });
    const result = await gate.run(makeCtx(repoRoot));

    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('honours explicit sourceFiles override', async () => {
    const repoRoot = path.join(ROOT, 'override');
    await fs.ensureDir(repoRoot);
    const file = await writeFile(
      path.join(repoRoot, 'note.md'),
      'See [missing](./missing.md).',
    );

    const gate = new DeadLinksGate({ sourceFiles: [file] });
    const result = await gate.run(makeCtx(repoRoot));

    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.message).toContain('./missing.md');
  });

  it('treats directory targets as valid and flags anchors on directories', async () => {
    const repoRoot = path.join(ROOT, 'dir-target');
    await fs.ensureDir(repoRoot);
    await fs.ensureDir(path.join(repoRoot, 'docs'));
    await writeFile(
      path.join(repoRoot, 'README.md'),
      [
        'See [docs dir](./docs).',
        'See [docs anchor](./docs#nope).',
      ].join('\n'),
    );

    const gate = new DeadLinksGate({ patterns: ['README.md'] });
    const result = await gate.run(makeCtx(repoRoot));

    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.message).toMatch(/directory with an anchor/);
  });

  it('resolves repo-root absolute style links', async () => {
    const repoRoot = path.join(ROOT, 'abs-style');
    await fs.ensureDir(repoRoot);
    await writeFile(
      path.join(repoRoot, 'docs/a.md'),
      'See [root](/README.md) and [missing](/nope.md).',
    );
    await writeFile(path.join(repoRoot, 'README.md'), '# root');

    const gate = new DeadLinksGate({ patterns: ['docs/**/*.md'] });
    const result = await gate.run(makeCtx(repoRoot));

    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.message).toContain('/nope.md');
  });
});
