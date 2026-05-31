/**
 * Tests for 15-npm-publish-dryrun.ts
 *
 * Strategy: build a synthetic AuditContext and inject the npm runner so we
 * never spawn a real `npm publish --dry-run`. We assert the gate's contract:
 *
 *  - vacuous pass when there are no workspace packages
 *  - clean pass when every dry-run output includes a root README.md
 *  - major finding (one per package) when README.md is absent from the listing
 *  - major finding when the runner throws (e.g. npm missing)
 *  - major finding when npm exits non-zero AND output is unparseable
 *  - findings include `file`, `component`, and an actionable `suggestion`
 *  - parser tolerates both "npm notice <size> <file>" and bare "<size> <file>" shapes
 *  - root-level README.md is recognised; nested docs/README.md is NOT
 *  - the gate's `passed` flag follows the GateFail/GateOk contract
 *  - duration_ms is non-negative
 */

import * as os from 'node:os';
import * as path from 'node:path';

import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  NpmPublishDryRunGate,
  defaultNpmDryRunRunner,
  parseNpmDryRunFileList,
  type NpmDryRunInvocation,
  type NpmDryRunRunner,
} from '../../gates/15-npm-publish-dryrun.js';
import type { AuditContext, Logger } from '../../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function silentLogger(): Logger {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}

function makeCtx(
  repoRoot: string,
  packageJsons: { package: string; path: string }[],
): AuditContext {
  return {
    repoRoot,
    manifests: [],
    uiKitSrcDir: path.join(repoRoot, 'packages/ui-kit/src'),
    appsWebSrcDir: path.join(repoRoot, 'apps/web/src'),
    tokensFile: path.join(repoRoot, 'packages/ui-kit/src/tokens.ts'),
    registryFile: path.join(repoRoot, 'packages/ui-kit/src/registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons,
    logger: silentLogger(),
  };
}

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'npm-dryrun-test-'));
});

afterEach(async () => {
  await fs.remove(tmpRoot).catch(() => undefined);
});

// ---------------------------------------------------------------------------
// Canonical sample outputs
// ---------------------------------------------------------------------------

function sampleOutputWithReadme(packageName: string): string {
  return [
    `npm notice`,
    `npm notice === Tarball Contents ===`,
    `npm notice 1.2kB README.md`,
    `npm notice 312B  package.json`,
    `npm notice 4.8kB dist/index.js`,
    `npm notice 1.0kB dist/index.cjs`,
    `npm notice 720B  dist/index.d.ts`,
    `npm notice`,
    `npm notice === Tarball Details ===`,
    `npm notice name: ${packageName}`,
    `npm notice version: 1.0.0`,
    `+ ${packageName}@1.0.0`,
  ].join('\n');
}

function sampleOutputMissingReadme(packageName: string): string {
  return [
    `npm notice`,
    `npm notice === Tarball Contents ===`,
    `npm notice 312B  package.json`,
    `npm notice 4.8kB dist/index.js`,
    `npm notice 720B  dist/index.d.ts`,
    `npm notice`,
    `npm notice === Tarball Details ===`,
    `npm notice name: ${packageName}`,
    `npm notice version: 1.0.0`,
    `+ ${packageName}@1.0.0`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// parseNpmDryRunFileList — pure parser unit tests
// ---------------------------------------------------------------------------

describe('parseNpmDryRunFileList', () => {
  it('extracts files from the npm-notice format', () => {
    const parsed = parseNpmDryRunFileList(sampleOutputWithReadme('@pxlkit/x'));
    expect(parsed.hasRootReadme).toBe(true);
    expect(parsed.files).toContain('README.md');
    expect(parsed.files).toContain('package.json');
    expect(parsed.files).toContain('dist/index.js');
  });

  it('extracts files from the bare "<size> <file>" shape', () => {
    const out = ['1.2kB README.md', '312B  package.json', '4.8kB dist/index.js'].join(
      '\n',
    );
    const parsed = parseNpmDryRunFileList(out);
    expect(parsed.hasRootReadme).toBe(true);
    expect(parsed.files).toEqual(
      expect.arrayContaining(['README.md', 'package.json', 'dist/index.js']),
    );
  });

  it('flags missing root README.md', () => {
    const parsed = parseNpmDryRunFileList(
      sampleOutputMissingReadme('@pxlkit/x'),
    );
    expect(parsed.hasRootReadme).toBe(false);
    expect(parsed.rootReadmeBasenames).toEqual([]);
  });

  it('does NOT count nested docs/README.md as a root README', () => {
    const out = [
      'npm notice 1.2kB docs/README.md',
      'npm notice 312B  package.json',
    ].join('\n');
    const parsed = parseNpmDryRunFileList(out);
    expect(parsed.hasRootReadme).toBe(false);
    expect(parsed.files).toContain('docs/README.md');
  });

  it('treats README.markdown / README.mkd as readme-ish but NOT registry-renderable', () => {
    const out = [
      'npm notice 1.2kB README.markdown',
      'npm notice 312B  package.json',
    ].join('\n');
    const parsed = parseNpmDryRunFileList(out);
    // it is a root readme variant -> shows up in basenames…
    expect(parsed.rootReadmeBasenames).toContain('readme.markdown');
    // …but only README.md unlocks the registry's rendered README
    expect(parsed.hasRootReadme).toBe(false);
  });

  it('returns an empty list on empty input', () => {
    const parsed = parseNpmDryRunFileList('');
    expect(parsed.files).toEqual([]);
    expect(parsed.hasRootReadme).toBe(false);
  });

  it('is tolerant of windows backslash separators', () => {
    const out = `npm notice 1.2kB dist\\index.js\nnpm notice 312B  README.md`;
    const parsed = parseNpmDryRunFileList(out);
    expect(parsed.files).toContain('dist/index.js');
    expect(parsed.hasRootReadme).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// NpmPublishDryRunGate
// ---------------------------------------------------------------------------

describe('NpmPublishDryRunGate', () => {
  it('identifies itself with id=15 and the canonical name', () => {
    const gate = new NpmPublishDryRunGate();
    expect(gate.id).toBe(15);
    expect(gate.name).toBe('npm-publish-dryrun');
    expect(gate.description.length).toBeGreaterThan(20);
  });

  it('passes vacuously when there are no workspace packages', async () => {
    const ctx = makeCtx(tmpRoot, []);
    const runner = vi.fn<NpmDryRunRunner>(async () => ({
      packageName: '',
      exitCode: 0,
      output: '',
    }));
    const gate = new NpmPublishDryRunGate({ runner });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.name).toBe('npm-publish-dryrun');
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
    expect(runner).not.toHaveBeenCalled();
  });

  it('passes when every package would publish a root README.md', async () => {
    const ctx = makeCtx(tmpRoot, [
      {
        package: '@pxlkit/ui-kit',
        path: path.join(tmpRoot, 'packages/ui-kit/package.json'),
      },
      {
        package: '@pxlkit/effects',
        path: path.join(tmpRoot, 'packages/effects/package.json'),
      },
    ]);
    const runner = vi.fn<NpmDryRunRunner>(async ({ packageName }) => ({
      packageName,
      exitCode: 0,
      output: sampleOutputWithReadme(packageName),
    }));
    const gate = new NpmPublishDryRunGate({ runner });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(runner).toHaveBeenCalledTimes(2);
    const calls = runner.mock.calls.map((c) => c[0].packageName);
    expect(calls).toEqual(['@pxlkit/ui-kit', '@pxlkit/effects']);
  });

  it('emits a major finding per package whose tarball would lack README.md', async () => {
    const ctx = makeCtx(tmpRoot, [
      {
        package: '@pxlkit/ui-kit',
        path: path.join(tmpRoot, 'packages/ui-kit/package.json'),
      },
      {
        package: '@pxlkit/effects',
        path: path.join(tmpRoot, 'packages/effects/package.json'),
      },
    ]);
    const runner: NpmDryRunRunner = async ({ packageName }) => {
      if (packageName === '@pxlkit/ui-kit') {
        return {
          packageName,
          exitCode: 0,
          output: sampleOutputWithReadme(packageName),
        };
      }
      return {
        packageName,
        exitCode: 0,
        output: sampleOutputMissingReadme(packageName),
      };
    };
    const gate = new NpmPublishDryRunGate({ runner });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    const finding = result.findings[0];
    expect(finding.severity).toBe('major');
    expect(finding.component).toBe('@pxlkit/effects');
    expect(finding.file?.replace(/\\/g, '/')).toBe(
      'packages/effects/package.json',
    );
    expect(finding.message).toMatch(/without a README\.md/);
    expect(finding.suggestion).toMatch(/README\.md/);
    expect(finding.suggestion).toMatch(/--workspace=@pxlkit\/effects/);
  });

  it('notes when a non-.md README variant was found (e.g. README.markdown)', async () => {
    const ctx = makeCtx(tmpRoot, [
      {
        package: '@pxlkit/ui-kit',
        path: path.join(tmpRoot, 'packages/ui-kit/package.json'),
      },
    ]);
    const runner: NpmDryRunRunner = async ({ packageName }) => ({
      packageName,
      exitCode: 0,
      output: [
        'npm notice 1.2kB README.markdown',
        'npm notice 312B  package.json',
        'npm notice 4.8kB dist/index.js',
      ].join('\n'),
    });
    const gate = new NpmPublishDryRunGate({ runner });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].message).toMatch(/readme\.markdown/);
    expect(result.findings[0].message).toMatch(
      /npm registry only renders README\.md/,
    );
  });

  it('records a major finding when the runner throws', async () => {
    const ctx = makeCtx(tmpRoot, [
      {
        package: '@pxlkit/ui-kit',
        path: path.join(tmpRoot, 'packages/ui-kit/package.json'),
      },
    ]);
    const runner: NpmDryRunRunner = async () => {
      throw new Error('ENOENT: npm not found');
    };
    const gate = new NpmPublishDryRunGate({ runner });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    const finding = result.findings[0];
    expect(finding.severity).toBe('major');
    expect(finding.component).toBe('@pxlkit/ui-kit');
    expect(finding.message).toMatch(/failed to invoke npm publish --dry-run/);
    expect(finding.message).toMatch(/ENOENT/);
    expect(finding.suggestion).toBeTruthy();
  });

  it('records a major finding when npm exits non-zero with unparseable output', async () => {
    const ctx = makeCtx(tmpRoot, [
      {
        package: '@pxlkit/ui-kit',
        path: path.join(tmpRoot, 'packages/ui-kit/package.json'),
      },
    ]);
    const runner: NpmDryRunRunner = async ({ packageName }) => ({
      packageName,
      exitCode: 1,
      output: 'npm ERR! workspace not found',
    });
    const gate = new NpmPublishDryRunGate({ runner });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    const finding = result.findings[0];
    expect(finding.severity).toBe('major');
    expect(finding.message).toMatch(/exited 1/);
    expect(finding.suggestion).toMatch(/--workspace=@pxlkit\/ui-kit/);
  });

  it('exposes a default npm runner with the expected callable shape', () => {
    expect(typeof defaultNpmDryRunRunner).toBe('function');
    expect(defaultNpmDryRunRunner.length).toBe(1);
  });

  it('returns a non-negative duration_ms', async () => {
    const ctx = makeCtx(tmpRoot, []);
    const gate = new NpmPublishDryRunGate({
      runner: async (): Promise<NpmDryRunInvocation> => ({
        packageName: '',
        exitCode: 0,
        output: '',
      }),
    });
    const result = await gate.run(ctx);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
    expect(typeof result.duration_ms).toBe('number');
  });
});
