/**
 * Tests for Gate 6 — consistency-version.
 *
 * Operates against a temp filesystem so we can mint package.json,
 * CHANGELOG.md and inject manifests via a mocked AuditContext without
 * touching real packages.
 */

import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { AuditContext, ManifestRecord } from '../../_lib/load-context.js';
import gate, {
  ConsistencyVersionGate,
  collectManifestSinceVersions,
  compareSemver,
  extractTopChangelogVersion,
  parseSemver,
  pickLargest,
} from '../../gates/06-consistency-version.js';

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'gate6-'));
});

afterEach(async () => {
  await fs.remove(tmpRoot);
});

interface MakePackageOpts {
  name: string;
  version: string;
  changelogTopVersion?: string | null; // null = no CHANGELOG file at all
  changelogBody?: string;              // override default
}

async function makePackage(opts: MakePackageOpts): Promise<{
  packageDir: string;
  packageJsonPath: string;
  changelogPath: string | null;
}> {
  const pkgDir = path.join(tmpRoot, 'packages', opts.name.replace(/^@.*\//, ''));
  await fs.ensureDir(pkgDir);
  const packageJsonPath = path.join(pkgDir, 'package.json');
  await fs.writeJson(packageJsonPath, { name: opts.name, version: opts.version });

  let changelogPath: string | null = null;
  if (opts.changelogTopVersion !== null) {
    changelogPath = path.join(pkgDir, 'CHANGELOG.md');
    const body =
      opts.changelogBody ??
      `# ${opts.name} — Changelog\n\n## ${opts.changelogTopVersion ?? opts.version} — 2026-05-30\n\n- Initial.\n`;
    await fs.writeFile(changelogPath, body, 'utf8');
  }

  return { packageDir: pkgDir, packageJsonPath, changelogPath };
}

function mkManifest(packageDir: string, component: string, since: string): ManifestRecord {
  return {
    component,
    source: path.join(packageDir, 'src', `${component}.manifest.ts`),
    // since is preserved via passthrough; not part of the typed schema fields
    since,
  } as unknown as ManifestRecord;
}

function mockCtx(parts: {
  packageJsons: Array<{ package: string; path: string }>;
  changelogFiles: Array<{ package: string; path: string }>;
  manifests: ManifestRecord[];
}): AuditContext {
  return {
    repoRoot: tmpRoot,
    manifests: parts.manifests,
    uiKitSrcDir: path.join(tmpRoot, 'packages/ui-kit/src'),
    appsWebSrcDir: path.join(tmpRoot, 'apps/web/src'),
    tokensFile: path.join(tmpRoot, 'packages/ui-kit/src/tokens.ts'),
    registryFile: path.join(tmpRoot, 'packages/ui-kit/src/registry.ts'),
    readmeFiles: [],
    changelogFiles: parts.changelogFiles,
    packageJsons: parts.packageJsons,
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
  };
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe('parseSemver', () => {
  it('parses 1.2.3', () => {
    expect(parseSemver('1.2.3')).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: null,
      raw: '1.2.3',
    });
  });

  it('parses prereleases', () => {
    const sv = parseSemver('2.0.0-beta.1');
    expect(sv).not.toBeNull();
    expect(sv!.prerelease).toBe('beta.1');
  });

  it('rejects garbage', () => {
    expect(parseSemver('not-a-version')).toBeNull();
    expect(parseSemver('1.2')).toBeNull();
  });
});

describe('compareSemver', () => {
  it('orders by major/minor/patch', () => {
    const a = parseSemver('1.0.0')!;
    const b = parseSemver('1.0.1')!;
    const c = parseSemver('2.0.0')!;
    expect(compareSemver(a, b)).toBe(-1);
    expect(compareSemver(b, a)).toBe(1);
    expect(compareSemver(a, a)).toBe(0);
    expect(compareSemver(c, b)).toBe(1);
  });

  it('treats prerelease as less than release', () => {
    const pre = parseSemver('1.0.0-beta.1')!;
    const stable = parseSemver('1.0.0')!;
    expect(compareSemver(pre, stable)).toBe(-1);
  });
});

describe('pickLargest', () => {
  it('returns null for empty', () => {
    expect(pickLargest([])).toBeNull();
  });

  it('picks the largest version', () => {
    const vs = ['1.0.0', '1.9.0', '0.4.2', '1.8.5'].map((v) => parseSemver(v)!);
    expect(pickLargest(vs)!.raw).toBe('1.9.0');
  });

  it('treats stable as larger than prerelease of the same triple', () => {
    const vs = ['2.0.0-beta.1', '2.0.0'].map((v) => parseSemver(v)!);
    expect(pickLargest(vs)!.raw).toBe('2.0.0');
  });
});

describe('extractTopChangelogVersion', () => {
  it('grabs the first ## heading', () => {
    const body =
      '# Changelog\n\n## 1.9.0 — 2026-05-30\n\n- thing\n\n## 1.8.0 — 2026-04-01\n';
    expect(extractTopChangelogVersion(body)).toBe('1.9.0');
  });

  it('tolerates a leading v', () => {
    const body = '# Changelog\n\n## v2.0.0\n';
    expect(extractTopChangelogVersion(body)).toBe('2.0.0');
  });

  it('returns null when nothing matches', () => {
    expect(extractTopChangelogVersion('# Changelog\n\nNothing here.\n')).toBeNull();
  });
});

describe('collectManifestSinceVersions', () => {
  it('only includes manifests whose source lives under the package dir', () => {
    const pkgDir = path.join(tmpRoot, 'packages', 'ui-kit');
    const otherDir = path.join(tmpRoot, 'packages', 'other');
    const manifests = [
      mkManifest(pkgDir, 'PixelA', '1.0.0'),
      mkManifest(pkgDir, 'PixelB', '1.5.0'),
      mkManifest(otherDir, 'OtherA', '9.9.9'),
    ];
    const { parsed, invalid } = collectManifestSinceVersions(manifests, pkgDir);
    expect(parsed.map((p) => p.raw).sort()).toEqual(['1.0.0', '1.5.0']);
    expect(invalid).toEqual([]);
  });

  it('reports invalid since values without throwing', () => {
    const pkgDir = path.join(tmpRoot, 'packages', 'ui-kit');
    const manifests = [
      mkManifest(pkgDir, 'PixelA', '1.0.0'),
      mkManifest(pkgDir, 'PixelB', 'banana'),
    ];
    const { parsed, invalid } = collectManifestSinceVersions(manifests, pkgDir);
    expect(parsed.map((p) => p.raw)).toEqual(['1.0.0']);
    expect(invalid).toHaveLength(1);
    expect(invalid[0]!.component).toBe('PixelB');
    expect(invalid[0]!.since).toBe('banana');
  });
});

// ---------------------------------------------------------------------------
// Gate.run() end-to-end against mocked AuditContext
// ---------------------------------------------------------------------------

describe('ConsistencyVersionGate.run', () => {
  it('passes when package.json, CHANGELOG top and largest since all agree', async () => {
    const { packageDir, packageJsonPath, changelogPath } = await makePackage({
      name: '@pxlkit/ui-kit',
      version: '1.9.0',
      changelogTopVersion: '1.9.0',
    });
    const ctx = mockCtx({
      packageJsons: [{ package: '@pxlkit/ui-kit', path: packageJsonPath }],
      changelogFiles: [{ package: '@pxlkit/ui-kit', path: changelogPath! }],
      manifests: [
        mkManifest(packageDir, 'PixelButton', '1.0.0'),
        mkManifest(packageDir, 'PixelDataTable', '1.9.0'),
      ],
    });

    const g = new ConsistencyVersionGate();
    const r = await g.run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
    expect(r.name).toBe('consistency-version');
    expect(typeof r.duration_ms).toBe('number');
  });

  it('fails (blocker) when CHANGELOG top diverges from package.json', async () => {
    const { packageDir, packageJsonPath, changelogPath } = await makePackage({
      name: '@pxlkit/ui-kit',
      version: '1.9.0',
      changelogTopVersion: '1.8.0',
    });
    const ctx = mockCtx({
      packageJsons: [{ package: '@pxlkit/ui-kit', path: packageJsonPath }],
      changelogFiles: [{ package: '@pxlkit/ui-kit', path: changelogPath! }],
      manifests: [mkManifest(packageDir, 'PixelButton', '1.9.0')],
    });

    const r = await gate.run(ctx);
    expect(r.passed).toBe(false);
    const blocker = r.findings.find(
      (f) => f.severity === 'blocker' && f.message.includes('CHANGELOG top'),
    );
    expect(blocker).toBeDefined();
    expect(blocker!.component).toBe('@pxlkit/ui-kit');
  });

  it('fails (blocker) when largest manifest.since exceeds package.json.version', async () => {
    const { packageDir, packageJsonPath, changelogPath } = await makePackage({
      name: '@pxlkit/ui-kit',
      version: '1.9.0',
      changelogTopVersion: '1.9.0',
    });
    const ctx = mockCtx({
      packageJsons: [{ package: '@pxlkit/ui-kit', path: packageJsonPath }],
      changelogFiles: [{ package: '@pxlkit/ui-kit', path: changelogPath! }],
      manifests: [
        mkManifest(packageDir, 'PixelButton', '1.9.0'),
        mkManifest(packageDir, 'PixelFuture', '2.0.0'),
      ],
    });

    const r = await gate.run(ctx);
    expect(r.passed).toBe(false);
    expect(
      r.findings.some(
        (f) => f.severity === 'blocker' && f.message.includes('largest manifest.since'),
      ),
    ).toBe(true);
  });

  it('flags a missing CHANGELOG as blocker', async () => {
    const { packageDir, packageJsonPath } = await makePackage({
      name: '@pxlkit/ui-kit',
      version: '1.9.0',
      changelogTopVersion: null,
    });
    const ctx = mockCtx({
      packageJsons: [{ package: '@pxlkit/ui-kit', path: packageJsonPath }],
      changelogFiles: [],
      manifests: [mkManifest(packageDir, 'PixelButton', '1.9.0')],
    });

    const r = await gate.run(ctx);
    expect(r.passed).toBe(false);
    expect(
      r.findings.some(
        (f) => f.severity === 'blocker' && f.message.includes('CHANGELOG.md missing'),
      ),
    ).toBe(true);
  });

  it('flags invalid manifest.since values as major findings', async () => {
    const { packageDir, packageJsonPath, changelogPath } = await makePackage({
      name: '@pxlkit/ui-kit',
      version: '1.9.0',
      changelogTopVersion: '1.9.0',
    });
    const ctx = mockCtx({
      packageJsons: [{ package: '@pxlkit/ui-kit', path: packageJsonPath }],
      changelogFiles: [{ package: '@pxlkit/ui-kit', path: changelogPath! }],
      manifests: [
        mkManifest(packageDir, 'PixelButton', '1.9.0'),
        mkManifest(packageDir, 'PixelBroken', 'not-semver'),
      ],
    });

    const r = await gate.run(ctx);
    expect(r.passed).toBe(false);
    expect(
      r.findings.some(
        (f) =>
          f.severity === 'major' &&
          f.message.includes('manifest.since') &&
          f.component === 'PixelBroken',
      ),
    ).toBe(true);
  });

  it('returns info (and passes) when no packages are present', async () => {
    const ctx = mockCtx({ packageJsons: [], changelogFiles: [], manifests: [] });
    const r = await gate.run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings.length).toBe(1);
    expect(r.findings[0]!.severity).toBe('info');
  });

  it('exposes id, name and description matching the contract', () => {
    const g = new ConsistencyVersionGate();
    expect(g.id).toBe(6);
    expect(g.name).toBe('consistency-version');
    expect(g.description.toLowerCase()).toContain('package.json.version');
    expect(g.description.toLowerCase()).toContain('changelog');
    expect(g.description.toLowerCase()).toContain('since');
  });
});
