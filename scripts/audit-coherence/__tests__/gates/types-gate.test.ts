/**
 * Tests for 09-types-gate.ts
 *
 * Strategy: build a fully synthetic AuditContext rooted in a tmpdir and inject
 * both the examples-discovery hook and the tsc runner so we never spawn a real
 * TypeScript compiler. We assert the gate's contract:
 *
 *  - vacuous pass when no examples are discovered
 *  - clean pass when the runner reports exitCode=0 for every file
 *  - blocker findings (one per parsed diagnostic) when tsc reports errors
 *  - blocker finding when the runner throws (e.g. tsc unavailable)
 *  - findings include `file`, `component`, and an actionable `suggestion`
 *  - parser handles both `path(ln,col):` and `path:ln:col -` tsc shapes
 *  - the gate's `passed` flag matches the GateFail/GateOk contract
 *  - duration_ms is non-negative
 */

import * as os from 'node:os';
import * as path from 'node:path';

import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  TypesGate,
  defaultTscRunner,
  type TscInvocation,
  type TscRunner,
} from '../../gates/09-types-gate.js';
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

async function makeCtx(repoRoot: string): Promise<AuditContext> {
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
    logger: silentLogger(),
  };
}

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'types-gate-test-'));
});

afterEach(async () => {
  await fs.remove(tmpRoot).catch(() => undefined);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TypesGate', () => {
  it('identifies itself with id=9 and the canonical name', () => {
    const gate = new TypesGate();
    expect(gate.id).toBe(9);
    expect(gate.name).toBe('types-gate');
    expect(gate.description.length).toBeGreaterThan(20);
  });

  it('passes vacuously when no examples.tsx files are discovered', async () => {
    const ctx = await makeCtx(tmpRoot);
    const runner = vi.fn<TscRunner>(async () => ({
      file: '',
      exitCode: 0,
      output: '',
    }));
    const gate = new TypesGate({
      discoverExamples: async () => [],
      runner,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.name).toBe('types-gate');
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
    expect(runner).not.toHaveBeenCalled();
  });

  it('passes when every examples.tsx typechecks cleanly', async () => {
    const ctx = await makeCtx(tmpRoot);
    const examples = [
      path.join(tmpRoot, 'packages/ui-kit/src/button.examples.tsx'),
      path.join(tmpRoot, 'packages/ui-kit/src/card.examples.tsx'),
    ];
    const runner = vi.fn<TscRunner>(async ({ examplesFile }) => ({
      file: examplesFile,
      exitCode: 0,
      output: '',
    }));
    const gate = new TypesGate({
      discoverExamples: async () => examples,
      runner,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(runner).toHaveBeenCalledTimes(2);
    const calls = runner.mock.calls.map((c) => c[0].examplesFile);
    expect(calls).toEqual(examples);
  });

  it('produces a blocker finding per parsed tsc diagnostic (paren shape)', async () => {
    const ctx = await makeCtx(tmpRoot);
    const examplesFile = path.join(tmpRoot, 'packages/ui-kit/src/button.examples.tsx');
    const runner: TscRunner = async ({ examplesFile: f }) => ({
      file: f,
      exitCode: 2,
      output: [
        `${f}(7,12): error TS2322: Type 'string' is not assignable to type 'number'.`,
        `${f}(9,3): error TS2741: Property 'label' is missing in type '{}'.`,
      ].join('\n'),
    });
    const gate = new TypesGate({
      discoverExamples: async () => [examplesFile],
      runner,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(2);
    for (const f of result.findings) {
      expect(f.severity).toBe('blocker');
      expect(f.component).toBe('button');
      expect(f.file).toContain('button.examples.tsx');
      expect(f.suggestion).toBeTruthy();
    }
    expect(result.findings[0].message).toMatch(/TS2322/);
    expect(result.findings[1].message).toMatch(/TS2741/);
  });

  it('produces a blocker finding per parsed tsc diagnostic (colon shape)', async () => {
    const ctx = await makeCtx(tmpRoot);
    const examplesFile = path.join(tmpRoot, 'packages/ui-kit/src/card.examples.tsx');
    const runner: TscRunner = async ({ examplesFile: f }) => ({
      file: f,
      exitCode: 1,
      output: `${f}:14:5 - error TS2304: Cannot find name 'Bogus'.`,
    });
    const gate = new TypesGate({
      discoverExamples: async () => [examplesFile],
      runner,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    const finding = result.findings[0];
    expect(finding.severity).toBe('blocker');
    expect(finding.component).toBe('card');
    expect(finding.message).toMatch(/TS2304/);
    expect(finding.message).toMatch(/14:5/);
  });

  it('emits a synthetic blocker when runner exits non-zero but output is unparseable', async () => {
    const ctx = await makeCtx(tmpRoot);
    const examplesFile = path.join(tmpRoot, 'packages/ui-kit/src/weird.examples.tsx');
    const runner: TscRunner = async ({ examplesFile: f }) => ({
      file: f,
      exitCode: 3,
      output: 'a wild compiler crash appears',
    });
    const gate = new TypesGate({
      discoverExamples: async () => [examplesFile],
      runner,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    const finding = result.findings[0];
    expect(finding.severity).toBe('blocker');
    expect(finding.component).toBe('weird');
    // Either the "no parseable diagnostics" branch or the "looks like error"
    // catch-all is acceptable; both are blockers attributed to the file.
    expect(finding.file).toContain('weird.examples.tsx');
  });

  it('records a blocker when the runner throws (e.g. tsc binary missing)', async () => {
    const ctx = await makeCtx(tmpRoot);
    const examplesFile = path.join(tmpRoot, 'packages/ui-kit/src/missing.examples.tsx');
    const runner: TscRunner = async () => {
      throw new Error('ENOENT: tsc not found');
    };
    const gate = new TypesGate({
      discoverExamples: async () => [examplesFile],
      runner,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    const finding = result.findings[0];
    expect(finding.severity).toBe('blocker');
    expect(finding.message).toMatch(/failed to invoke tsc/);
    expect(finding.message).toMatch(/ENOENT/);
    expect(finding.component).toBe('missing');
  });

  it('aggregates diagnostics across multiple files in a single gate run', async () => {
    const ctx = await makeCtx(tmpRoot);
    const a = path.join(tmpRoot, 'packages/ui-kit/src/a.examples.tsx');
    const b = path.join(tmpRoot, 'packages/ui-kit/src/b.examples.tsx');
    const c = path.join(tmpRoot, 'packages/ui-kit/src/c.examples.tsx');
    const runner: TscRunner = async ({ examplesFile: f }) => {
      if (f === a) {
        return { file: f, exitCode: 0, output: '' };
      }
      if (f === b) {
        return {
          file: f,
          exitCode: 2,
          output: `${f}(3,1): error TS1005: ';' expected.`,
        };
      }
      return {
        file: f,
        exitCode: 2,
        output: [
          `${f}(1,1): error TS2307: Cannot find module 'foo'.`,
          `${f}(2,1): error TS2307: Cannot find module 'bar'.`,
        ].join('\n'),
      };
    };
    const gate = new TypesGate({
      discoverExamples: async () => [a, b, c],
      runner,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    // 0 (a) + 1 (b) + 2 (c) = 3 findings
    expect(result.findings).toHaveLength(3);
    const components = new Set(result.findings.map((f) => f.component));
    expect(components.has('a')).toBe(false);
    expect(components.has('b')).toBe(true);
    expect(components.has('c')).toBe(true);
  });

  it('exposes a default tsc runner with the expected callable shape', () => {
    expect(typeof defaultTscRunner).toBe('function');
    expect(defaultTscRunner.length).toBe(1);
  });

  it('returns a non-negative duration_ms', async () => {
    const ctx = await makeCtx(tmpRoot);
    const gate = new TypesGate({
      discoverExamples: async () => [],
      runner: async (): Promise<TscInvocation> => ({
        file: '',
        exitCode: 0,
        output: '',
      }),
    });
    const result = await gate.run(ctx);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
    expect(typeof result.duration_ms).toBe('number');
  });
});
