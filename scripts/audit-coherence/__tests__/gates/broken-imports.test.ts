/**
 * Tests for 14-broken-imports.ts
 *
 * Strategy:
 *  - Build a synthetic AuditContext rooted in a tmpdir.
 *  - Inject the file discovery hook to feed in-memory SourceFiles directly
 *    (so we never touch the real monorepo).
 *  - Inject the import resolver to assert the gate composes results faithfully.
 *  - Also unit-test the standalone `extractImports` helper, which carries the
 *    bulk of the regex risk surface.
 *
 * Contract checked:
 *  - id/name/description match what callers depend on.
 *  - Vacuous pass when no .tsx files are discovered.
 *  - Clean pass when every import resolves.
 *  - Per-broken-import blocker findings with file + component + suggestion.
 *  - Resolver exceptions surface as blocker findings (not gate crashes).
 *  - Static / dynamic / re-export shapes are all extracted.
 *  - Commented-out imports are ignored.
 *  - duration_ms is a non-negative number.
 */

import * as os from 'node:os';
import * as path from 'node:path';

import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BrokenImportsGate,
  defaultResolver,
  extractImports,
  type ResolveImportInput,
  type ResolveImportResult,
  type SourceFile,
} from '../../gates/14-broken-imports.js';
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
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'broken-imports-test-'));
});

afterEach(async () => {
  await fs.remove(tmpRoot).catch(() => undefined);
});

// ---------------------------------------------------------------------------
// extractImports
// ---------------------------------------------------------------------------

describe('extractImports', () => {
  it('captures default + named static imports', () => {
    const src = [
      "import React from 'react';",
      "import { useState, type FC } from 'react';",
      "import * as path from 'node:path';",
    ].join('\n');
    const out = extractImports(src);
    const specs = out.map((o) => o.specifier).sort();
    expect(specs).toEqual(['node:path', 'react', 'react'].sort());
    for (const o of out) {
      expect(o.kind).toBe('static');
      expect(o.line).toBeGreaterThan(0);
    }
  });

  it('captures side-effect-only imports', () => {
    const src = "import './side-effect.css';\nimport 'normalize.css';";
    const out = extractImports(src);
    const specs = out.map((o) => o.specifier).sort();
    expect(specs).toContain('./side-effect.css');
    expect(specs).toContain('normalize.css');
  });

  it('captures dynamic imports', () => {
    const src = "const m = await import('./lazy');\nawait import(\"react\");";
    const out = extractImports(src);
    const dyn = out.filter((o) => o.kind === 'dynamic');
    expect(dyn.map((o) => o.specifier).sort()).toEqual(['./lazy', 'react']);
  });

  it('captures re-exports', () => {
    const src = [
      "export * from './a';",
      "export { foo, bar } from './b';",
    ].join('\n');
    const out = extractImports(src);
    expect(out.every((o) => o.kind === 'reexport')).toBe(true);
    expect(out.map((o) => o.specifier).sort()).toEqual(['./a', './b']);
  });

  it('ignores commented-out imports', () => {
    const src = [
      "// import { ghost } from './ghost';",
      "/* import { phantom } from './phantom'; */",
      "import { real } from './real';",
    ].join('\n');
    const out = extractImports(src);
    expect(out.map((o) => o.specifier)).toEqual(['./real']);
  });

  it('returns a non-negative line number for each import', () => {
    const src = "\n\nimport x from './x';\n";
    const out = extractImports(src);
    expect(out).toHaveLength(1);
    expect(out[0].line).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Gate identity
// ---------------------------------------------------------------------------

describe('BrokenImportsGate identity', () => {
  it('identifies itself with id=14 and the canonical name', () => {
    const gate = new BrokenImportsGate();
    expect(gate.id).toBe(14);
    expect(gate.name).toBe('broken-imports');
    expect(gate.description.length).toBeGreaterThan(20);
  });

  it('exposes a default resolver with the expected callable shape', () => {
    expect(typeof defaultResolver).toBe('function');
    // (input) => Promise — arity 1
    expect(defaultResolver.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Gate behaviour
// ---------------------------------------------------------------------------

describe('BrokenImportsGate.run', () => {
  it('passes vacuously when no .tsx files are discovered', async () => {
    const ctx = await makeCtx(tmpRoot);
    const resolver = vi.fn<
      (input: ResolveImportInput) => Promise<ResolveImportResult>
    >(async () => ({ ok: true, resolved: 'noop' }));
    const gate = new BrokenImportsGate({
      discoverFiles: async () => [],
      resolveImport: resolver,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.name).toBe('broken-imports');
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
    expect(resolver).not.toHaveBeenCalled();
  });

  it('passes when every import in every file resolves', async () => {
    const ctx = await makeCtx(tmpRoot);
    const files: SourceFile[] = [
      {
        file: path.join(tmpRoot, 'apps/web/src/page.tsx'),
        content: [
          "import React from 'react';",
          "import { Button } from '@pxlkit/ui-kit';",
          "import './page.css';",
        ].join('\n'),
      },
      {
        file: path.join(tmpRoot, 'packages/ui-kit/src/button.tsx'),
        content: "import * as React from 'react';\nexport const x = 1;",
      },
    ];
    const resolver = vi.fn<
      (input: ResolveImportInput) => Promise<ResolveImportResult>
    >(async () => ({ ok: true, resolved: '/resolved' }));
    const gate = new BrokenImportsGate({
      discoverFiles: async () => files,
      resolveImport: resolver,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(resolver).toHaveBeenCalled();
    expect(resolver.mock.calls.length).toBeGreaterThanOrEqual(4);
  });

  it('produces a blocker finding per broken import', async () => {
    const ctx = await makeCtx(tmpRoot);
    const aFile = path.join(tmpRoot, 'packages/ui-kit/src/a.tsx');
    const bFile = path.join(tmpRoot, 'apps/web/src/b.tsx');
    const files: SourceFile[] = [
      {
        file: aFile,
        content: [
          "import { gone } from './gone';",
          "import legit from 'react';",
        ].join('\n'),
      },
      {
        file: bFile,
        content: "import { missing } from 'never-installed';",
      },
    ];
    const resolver = async (
      input: ResolveImportInput,
    ): Promise<ResolveImportResult> => {
      if (input.spec.specifier === './gone') {
        return {
          ok: false,
          reason: 'relative target missing',
          suggestion: 'create the file or remove the import',
        };
      }
      if (input.spec.specifier === 'never-installed') {
        return { ok: false, reason: 'not a declared dependency' };
      }
      return { ok: true, resolved: 'fine' };
    };
    const gate = new BrokenImportsGate({
      discoverFiles: async () => files,
      resolveImport: resolver,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(2);
    for (const f of result.findings) {
      expect(f.severity).toBe('blocker');
      expect(f.file).toBeTruthy();
      expect(f.component).toBeTruthy();
    }
    const messages = result.findings.map((f) => f.message).join('\n');
    expect(messages).toMatch(/\.\/gone/);
    expect(messages).toMatch(/never-installed/);
    // The first finding inherits the suggestion handed back by the resolver.
    const goneFinding = result.findings.find((f) =>
      f.message.includes('./gone'),
    );
    expect(goneFinding?.suggestion).toMatch(/create the file/);
  });

  it('attributes finding.component to the source file basename without .tsx', async () => {
    const ctx = await makeCtx(tmpRoot);
    const file = path.join(tmpRoot, 'packages/ui-kit/src/super-button.tsx');
    const files: SourceFile[] = [
      { file, content: "import x from './nope';" },
    ];
    const resolver = async (): Promise<ResolveImportResult> => ({
      ok: false,
      reason: 'nope',
    });
    const gate = new BrokenImportsGate({
      discoverFiles: async () => files,
      resolveImport: resolver,
    });
    const result = await gate.run(ctx);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].component).toBe('super-button');
    expect(result.findings[0].file).toContain('super-button.tsx');
  });

  it('surfaces resolver exceptions as blocker findings (no crash)', async () => {
    const ctx = await makeCtx(tmpRoot);
    const file = path.join(tmpRoot, 'apps/web/src/boom.tsx');
    const files: SourceFile[] = [
      { file, content: "import x from './something';" },
    ];
    const resolver = async (): Promise<ResolveImportResult> => {
      throw new Error('resolver exploded');
    };
    const gate = new BrokenImportsGate({
      discoverFiles: async () => files,
      resolveImport: resolver,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('blocker');
    expect(result.findings[0].message).toMatch(/resolver threw/);
    expect(result.findings[0].message).toMatch(/resolver exploded/);
  });

  it('only emits findings for unresolved imports — clean ones do not appear', async () => {
    const ctx = await makeCtx(tmpRoot);
    const file = path.join(tmpRoot, 'apps/web/src/mixed.tsx');
    const files: SourceFile[] = [
      {
        file,
        content: [
          "import a from './ok';",
          "import b from './broken';",
          "import c from 'react';",
        ].join('\n'),
      },
    ];
    const resolver = async (
      input: ResolveImportInput,
    ): Promise<ResolveImportResult> => {
      if (input.spec.specifier === './broken') {
        return { ok: false, reason: 'gone' };
      }
      return { ok: true, resolved: 'ok' };
    };
    const gate = new BrokenImportsGate({
      discoverFiles: async () => files,
      resolveImport: resolver,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].message).toMatch(/\.\/broken/);
  });

  it('aggregates findings across multiple files', async () => {
    const ctx = await makeCtx(tmpRoot);
    const a = path.join(tmpRoot, 'apps/web/src/a.tsx');
    const b = path.join(tmpRoot, 'apps/web/src/b.tsx');
    const c = path.join(tmpRoot, 'packages/ui-kit/src/c.tsx');
    const files: SourceFile[] = [
      { file: a, content: "import x from './x';" },
      { file: b, content: "import y from './y';\nimport z from './z';" },
      { file: c, content: "import { ok } from 'react';" },
    ];
    const resolver = async (
      input: ResolveImportInput,
    ): Promise<ResolveImportResult> => {
      if (input.fromFile === c) return { ok: true, resolved: 'ok' };
      return { ok: false, reason: `nope ${input.spec.specifier}` };
    };
    const gate = new BrokenImportsGate({
      discoverFiles: async () => files,
      resolveImport: resolver,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    // 1 (a) + 2 (b) + 0 (c) = 3 findings
    expect(result.findings).toHaveLength(3);
    const componentsHit = new Set(result.findings.map((f) => f.component));
    expect(componentsHit.has('a')).toBe(true);
    expect(componentsHit.has('b')).toBe(true);
    expect(componentsHit.has('c')).toBe(false);
  });

  it('returns a non-negative duration_ms', async () => {
    const ctx = await makeCtx(tmpRoot);
    const gate = new BrokenImportsGate({
      discoverFiles: async () => [],
      resolveImport: async () => ({ ok: true, resolved: 'noop' }),
    });
    const result = await gate.run(ctx);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
    expect(typeof result.duration_ms).toBe('number');
  });
});
