/**
 * Unit tests for Gate 17 — deprecated-lifecycle.
 *
 * The AuditContext is fully mocked. Package.json reads are stubbed via the
 * `readPackageJson` option so we never touch the real filesystem.
 */

import * as path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import type { AuditContext, ManifestRecord } from '../../_lib/load-context.js';
import gate, {
  DeprecatedLifecycleGate,
  evaluateLifecycle,
  manifestBelongsToPackage,
  parseSemver,
  resolveOwningPackage,
} from '../../gates/17-deprecated-lifecycle.js';

// ---------------------------------------------------------------------------
// Helpers — synthetic in-memory repo
// ---------------------------------------------------------------------------

const repoRoot = path.resolve('/virtual/repo');
const uiKitDir = path.join(repoRoot, 'packages', 'ui-kit');
const uiKitPkgJson = path.join(uiKitDir, 'package.json');

function mkManifest(
  packageDir: string,
  component: string,
  fields: Record<string, unknown> = {},
): ManifestRecord {
  return {
    component,
    source: path.join(packageDir, 'src', `${component}.manifest.ts`),
    ...fields,
  } as unknown as ManifestRecord;
}

function makeCtx(
  manifests: ManifestRecord[],
  packageJsons: Array<{ package: string; path: string }> = [
    { package: '@pxlkit/ui-kit', path: uiKitPkgJson },
  ],
): AuditContext {
  return {
    repoRoot,
    manifests,
    uiKitSrcDir: path.join(uiKitDir, 'src'),
    appsWebSrcDir: path.join(repoRoot, 'apps/web/src'),
    tokensFile: path.join(uiKitDir, 'src/tokens.ts'),
    registryFile: path.join(uiKitDir, 'src/registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons,
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
  };
}

function pkgReader(byPath: Record<string, { version?: string } | null>) {
  return vi.fn(async (absPath: string) => byPath[absPath] ?? null);
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe('parseSemver', () => {
  it('parses standard semver', () => {
    expect(parseSemver('1.9.0')!.major).toBe(1);
    expect(parseSemver('2.0.0-beta.1')!.prerelease).toBe('beta.1');
  });

  it('rejects garbage', () => {
    expect(parseSemver('not-semver')).toBeNull();
    expect(parseSemver('1.0')).toBeNull();
  });
});

describe('manifestBelongsToPackage / resolveOwningPackage', () => {
  it('resolves a manifest to its owning package', () => {
    const m = mkManifest(uiKitDir, 'PixelLegacy', { status: 'deprecated' });
    expect(manifestBelongsToPackage(m, uiKitDir)).toBe(true);
    const owner = resolveOwningPackage(m, [
      { package: '@pxlkit/ui-kit', path: uiKitPkgJson },
    ]);
    expect(owner?.package).toBe('@pxlkit/ui-kit');
  });

  it('returns null when no package owns the manifest', () => {
    const m = mkManifest(path.join(repoRoot, 'packages', 'other'), 'Stranger');
    const owner = resolveOwningPackage(m, [
      { package: '@pxlkit/ui-kit', path: uiKitPkgJson },
    ]);
    expect(owner).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Pure rule
// ---------------------------------------------------------------------------

describe('evaluateLifecycle', () => {
  it('returns null when removal target is current_major + 1', () => {
    expect(evaluateLifecycle('2.0.0', 1)).toBeNull();
  });

  it('returns null when removal target is the current major', () => {
    expect(evaluateLifecycle('1.9.0', 1)).toBeNull();
  });

  it('flags missing removed-in', () => {
    expect(evaluateLifecycle(undefined, 1)).toEqual({
      kind: 'missing-removed-in',
    });
    expect(evaluateLifecycle('', 1)).toEqual({ kind: 'missing-removed-in' });
    expect(evaluateLifecycle(null, 1)).toEqual({ kind: 'missing-removed-in' });
  });

  it('flags non-semver removed-in', () => {
    const v = evaluateLifecycle('banana', 1);
    expect(v?.kind).toBe('invalid-removed-in');
  });

  it('flags non-string removed-in', () => {
    const v = evaluateLifecycle(2, 1);
    expect(v?.kind).toBe('invalid-removed-in');
  });

  it('flags removal targets beyond current_major + 1 as too-far-out', () => {
    const v = evaluateLifecycle('3.0.0', 1);
    expect(v?.kind).toBe('too-far-out');
    if (v?.kind === 'too-far-out') {
      expect(v.removedInMajor).toBe(3);
      expect(v.maxAllowedMajor).toBe(2);
      expect(v.currentMajor).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// Gate.run() — end-to-end against mocked AuditContext
// ---------------------------------------------------------------------------

describe('DeprecatedLifecycleGate.run', () => {
  it('passes vacuously when there are no deprecated manifests', async () => {
    const ctx = makeCtx([
      mkManifest(uiKitDir, 'PixelButton', { status: 'stable' }),
    ]);
    const readPackageJson = pkgReader({});
    const g = new DeprecatedLifecycleGate({ readPackageJson });
    const r = await g.run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
    expect(r.name).toBe('deprecated-lifecycle');
    expect(typeof r.duration_ms).toBe('number');
    expect(readPackageJson).not.toHaveBeenCalled();
  });

  it('passes when every deprecated manifest has a valid in-window removal', async () => {
    const ctx = makeCtx([
      mkManifest(uiKitDir, 'PixelLegacy', {
        status: 'deprecated',
        deprecatedRemovedIn: '2.0.0',
      }),
      mkManifest(uiKitDir, 'PixelLegacy2', {
        status: 'deprecated',
        deprecatedRemovedIn: '1.9.0',
      }),
    ]);
    const readPackageJson = pkgReader({ [uiKitPkgJson]: { version: '1.9.0' } });
    const g = new DeprecatedLifecycleGate({ readPackageJson });
    const r = await g.run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
    // Cache: same package read at most once.
    expect(readPackageJson).toHaveBeenCalledTimes(1);
  });

  it('fails (major) when deprecatedRemovedIn is missing', async () => {
    const ctx = makeCtx([
      mkManifest(uiKitDir, 'PixelOrphan', { status: 'deprecated' }),
    ]);
    const readPackageJson = pkgReader({ [uiKitPkgJson]: { version: '1.9.0' } });
    const r = await new DeprecatedLifecycleGate({ readPackageJson }).run(ctx);
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(1);
    const f = r.findings[0]!;
    expect(f.severity).toBe('major');
    expect(f.component).toBe('PixelOrphan');
    expect(f.message.toLowerCase()).toContain('missing');
    expect(f.suggestion).toContain('2.0.0');
  });

  it('fails (major) when deprecatedRemovedIn is past current_major + 1', async () => {
    const ctx = makeCtx([
      mkManifest(uiKitDir, 'PixelTooFar', {
        status: 'deprecated',
        deprecatedRemovedIn: '3.0.0',
      }),
    ]);
    const readPackageJson = pkgReader({ [uiKitPkgJson]: { version: '1.9.0' } });
    const r = await new DeprecatedLifecycleGate({ readPackageJson }).run(ctx);
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(1);
    const f = r.findings[0]!;
    expect(f.severity).toBe('major');
    expect(f.component).toBe('PixelTooFar');
    expect(f.message).toContain('3.0.0');
    expect(f.message).toContain('current_major + 1');
    expect(f.suggestion).toContain('2.0.0');
  });

  it('fails (major) when deprecatedRemovedIn is not valid semver', async () => {
    const ctx = makeCtx([
      mkManifest(uiKitDir, 'PixelBadSemver', {
        status: 'deprecated',
        deprecatedRemovedIn: 'soon-ish',
      }),
    ]);
    const readPackageJson = pkgReader({ [uiKitPkgJson]: { version: '1.9.0' } });
    const r = await new DeprecatedLifecycleGate({ readPackageJson }).run(ctx);
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(1);
    const f = r.findings[0]!;
    expect(f.severity).toBe('major');
    expect(f.message.toLowerCase()).toContain('invalid');
  });

  it('reports a stranded manifest whose source matches no package', async () => {
    const stray = mkManifest(
      path.join(repoRoot, 'packages', 'phantom'),
      'PixelGhost',
      { status: 'deprecated', deprecatedRemovedIn: '2.0.0' },
    );
    const ctx = makeCtx([stray]);
    const readPackageJson = pkgReader({ [uiKitPkgJson]: { version: '1.9.0' } });
    const r = await new DeprecatedLifecycleGate({ readPackageJson }).run(ctx);
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]!.message).toContain('could not be matched');
    // Owning-package lookup short-circuits — no read happens for stranded manifests.
    expect(readPackageJson).not.toHaveBeenCalled();
  });

  it('reports a major when the owning package.json has no version', async () => {
    const ctx = makeCtx([
      mkManifest(uiKitDir, 'PixelLegacy', {
        status: 'deprecated',
        deprecatedRemovedIn: '2.0.0',
      }),
    ]);
    const readPackageJson = pkgReader({ [uiKitPkgJson]: {} });
    const r = await new DeprecatedLifecycleGate({ readPackageJson }).run(ctx);
    expect(r.passed).toBe(false);
    expect(
      r.findings.some((f) =>
        f.message.toLowerCase().includes('no readable version'),
      ),
    ).toBe(true);
  });

  it('reports a major when the owning package.json version is non-semver', async () => {
    const ctx = makeCtx([
      mkManifest(uiKitDir, 'PixelLegacy', {
        status: 'deprecated',
        deprecatedRemovedIn: '2.0.0',
      }),
    ]);
    const readPackageJson = pkgReader({
      [uiKitPkgJson]: { version: 'banana' },
    });
    const r = await new DeprecatedLifecycleGate({ readPackageJson }).run(ctx);
    expect(r.passed).toBe(false);
    expect(
      r.findings.some((f) =>
        f.message.toLowerCase().includes('not valid semver'),
      ),
    ).toBe(true);
  });

  it('caches the package.json read across multiple deprecated manifests in the same package', async () => {
    const ctx = makeCtx([
      mkManifest(uiKitDir, 'A', {
        status: 'deprecated',
        deprecatedRemovedIn: '2.0.0',
      }),
      mkManifest(uiKitDir, 'B', {
        status: 'deprecated',
        deprecatedRemovedIn: '1.9.0',
      }),
      mkManifest(uiKitDir, 'C', {
        status: 'deprecated',
        deprecatedRemovedIn: '2.0.0',
      }),
    ]);
    const readPackageJson = pkgReader({ [uiKitPkgJson]: { version: '1.9.0' } });
    const r = await new DeprecatedLifecycleGate({ readPackageJson }).run(ctx);
    expect(r.passed).toBe(true);
    expect(readPackageJson).toHaveBeenCalledTimes(1);
  });

  it('emits a single finding per offending manifest (no duplicate noise)', async () => {
    const ctx = makeCtx([
      mkManifest(uiKitDir, 'Bad1', {
        status: 'deprecated',
        // missing deprecatedRemovedIn
      }),
      mkManifest(uiKitDir, 'Bad2', {
        status: 'deprecated',
        deprecatedRemovedIn: '5.0.0',
      }),
      mkManifest(uiKitDir, 'Good', {
        status: 'deprecated',
        deprecatedRemovedIn: '2.0.0',
      }),
    ]);
    const readPackageJson = pkgReader({ [uiKitPkgJson]: { version: '1.9.0' } });
    const r = await new DeprecatedLifecycleGate({ readPackageJson }).run(ctx);
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(2);
    const components = r.findings.map((f) => f.component).sort();
    expect(components).toEqual(['Bad1', 'Bad2']);
  });

  it('exposes id, name, description matching the contract', () => {
    const g = new DeprecatedLifecycleGate();
    expect(g.id).toBe(17);
    expect(g.name).toBe('deprecated-lifecycle');
    expect(g.description.toLowerCase()).toContain('deprecated');
    expect(g.description.toLowerCase()).toContain('current_major');
  });

  it('default export is a usable singleton', async () => {
    const ctx = makeCtx([
      mkManifest(uiKitDir, 'PixelLegacy', {
        status: 'deprecated',
        deprecatedRemovedIn: '2.0.0',
      }),
    ]);
    // Spy on the default singleton path: it will try to read the real fs.
    // We swap the reader for this test by going through a fresh instance,
    // but still confirm the default export carries the gate contract.
    expect(gate.id).toBe(17);
    expect(gate.name).toBe('deprecated-lifecycle');
    // Sanity: run() exists on the default export.
    expect(typeof gate.run).toBe('function');
    // Avoid touching the filesystem: use our own reader instance and just
    // ensure the call path produces a sensible result alongside the default.
    const r = await new DeprecatedLifecycleGate({
      readPackageJson: pkgReader({ [uiKitPkgJson]: { version: '1.9.0' } }),
    }).run(ctx);
    expect(r.passed).toBe(true);
  });
});
