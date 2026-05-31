/**
 * Unit tests for Gate 8 — consistency-pkgjson.
 *
 * Mocks `fs-extra` so we exercise the gate end-to-end against a
 * synthetic AuditContext without touching the real filesystem.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as path from 'node:path';

vi.mock('fs-extra', () => {
  const readJson = vi.fn();
  return {
    default: { readJson },
    readJson,
  };
});

import * as fs from 'fs-extra';
import {
  CATEGORY_KEYWORDS,
  ConsistencyPkgJsonGate,
  DESCRIPTION_MAX_LENGTH,
  checkPackageJson,
  findMatchingKeyword,
  keywordsForPackage,
  normalizePackageSlug,
} from '../../gates/08-consistency-pkgjson.js';
import type { AuditContext } from '../../_lib/load-context.js';

const repoRoot = path.resolve('/virtual/repo');

function makeCtx(
  packages: { package: string; path: string }[],
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
    packageJsons: packages,
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
  };
}

const mockedReadJson = fs.readJson as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockedReadJson.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Pure-helper tests
// ---------------------------------------------------------------------------

describe('normalizePackageSlug', () => {
  it('strips scope and lowercases', () => {
    expect(normalizePackageSlug('@pxlkit/ui-kit')).toBe('ui-kit');
    expect(normalizePackageSlug('@pxlkit/Effects')).toBe('effects');
  });

  it('handles unscoped names', () => {
    expect(normalizePackageSlug('voxel')).toBe('voxel');
  });

  it('trims whitespace', () => {
    expect(normalizePackageSlug('  @pxlkit/core  ')).toBe('core');
  });
});

describe('keywordsForPackage', () => {
  it('returns the mapped bank when the slug is known', () => {
    expect(keywordsForPackage('@pxlkit/effects')).toBe(
      CATEGORY_KEYWORDS.effects,
    );
  });

  it('falls back to the default brand bank otherwise', () => {
    const result = keywordsForPackage('@pxlkit/brand-new');
    expect(result).toContain('pixel');
    expect(result).toContain('pxlkit');
  });
});

describe('findMatchingKeyword', () => {
  it('matches case-insensitive substrings', () => {
    expect(findMatchingKeyword('Animated VFX library', ['vfx'])).toBe('vfx');
    expect(findMatchingKeyword('A toolkit for icons', ['toolkit'])).toBe(
      'toolkit',
    );
  });

  it('returns null when no keyword is present', () => {
    expect(findMatchingKeyword('hello world', ['foo', 'bar'])).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// checkPackageJson (pure)
// ---------------------------------------------------------------------------

describe('checkPackageJson', () => {
  it('reports nothing when description is short and on-topic', () => {
    const { findings } = checkPackageJson(
      {
        name: '@pxlkit/effects',
        description: 'Animated visual effect pixel art icons — vfx pack.',
      },
      'packages/effects/package.json',
    );
    expect(findings).toEqual([]);
  });

  it('reports a finding when description is missing', () => {
    const { findings } = checkPackageJson(
      { name: '@pxlkit/effects' },
      'packages/effects/package.json',
    );
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('info');
    expect(findings[0].message).toMatch(/no "description"/);
    expect(findings[0].component).toBe('@pxlkit/effects');
  });

  it('reports a finding when description exceeds 155 chars', () => {
    const longDescription = 'effect '.repeat(40); // ~280 chars, contains "effect"
    const { findings } = checkPackageJson(
      { name: '@pxlkit/effects', description: longDescription },
      'packages/effects/package.json',
    );
    const lengthFinding = findings.find((f) => /exceeds/.test(f.message));
    expect(lengthFinding).toBeDefined();
    expect(lengthFinding?.severity).toBe('info');
    expect(lengthFinding?.message).toContain(
      String(DESCRIPTION_MAX_LENGTH),
    );
  });

  it('reports a finding when description omits the category keyword', () => {
    const { findings } = checkPackageJson(
      {
        name: '@pxlkit/effects',
        description:
          'A friendly retro library that helps developers ship cool things.',
      },
      'packages/effects/package.json',
    );
    const keywordFinding = findings.find((f) =>
      /primary-category keyword/.test(f.message),
    );
    expect(keywordFinding).toBeDefined();
    expect(keywordFinding?.severity).toBe('info');
    expect(keywordFinding?.suggestion).toMatch(/effect/);
  });

  it('accepts a custom maxLength override', () => {
    const { findings } = checkPackageJson(
      { name: '@pxlkit/effects', description: 'effect pack' },
      'packages/effects/package.json',
      { maxLength: 5 },
    );
    const lengthFinding = findings.find((f) => /exceeds/.test(f.message));
    expect(lengthFinding).toBeDefined();
    expect(lengthFinding?.message).toContain('5-char');
  });

  it('uses the default keyword bank for unknown packages', () => {
    const { findings } = checkPackageJson(
      {
        name: '@pxlkit/brand-new',
        description: 'A pxlkit experimental module for new ideas',
      },
      'packages/brand-new/package.json',
    );
    expect(findings).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Gate.run() — end-to-end with mocked filesystem
// ---------------------------------------------------------------------------

describe('ConsistencyPkgJsonGate.run', () => {
  it('passes when every package.json is clean', async () => {
    mockedReadJson.mockImplementation(async (file: string) => {
      if (file.includes('effects')) {
        return {
          name: '@pxlkit/effects',
          description: 'Animated visual effect pixel art icons pack.',
        };
      }
      return {
        name: '@pxlkit/ui-kit',
        description: 'Retro pixel art UI component kit with buttons and forms.',
      };
    });

    const ctx = makeCtx([
      {
        package: '@pxlkit/effects',
        path: path.join(repoRoot, 'packages/effects/package.json'),
      },
      {
        package: '@pxlkit/ui-kit',
        path: path.join(repoRoot, 'packages/ui-kit/package.json'),
      },
    ]);

    const gate = new ConsistencyPkgJsonGate();
    const result = await gate.run(ctx);

    expect(result.name).toBe('consistency-pkgjson');
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('reports findings without failing the gate (info-only)', async () => {
    const tooLong = 'A '.repeat(120) + 'effect'; // > 155 chars
    mockedReadJson.mockResolvedValue({
      name: '@pxlkit/effects',
      description: tooLong,
    });

    const ctx = makeCtx([
      {
        package: '@pxlkit/effects',
        path: path.join(repoRoot, 'packages/effects/package.json'),
      },
    ]);

    const gate = new ConsistencyPkgJsonGate();
    const result = await gate.run(ctx);

    expect(result.passed).toBe(true);
    expect(result.findings.length).toBeGreaterThan(0);
    for (const finding of result.findings) {
      expect(finding.severity).toBe('info');
      expect(finding.component).toBe('@pxlkit/effects');
    }
  });

  it('reports each problem the package has (length + missing keyword)', async () => {
    const longOffTopic = 'A '.repeat(120); // long AND no category keyword
    mockedReadJson.mockResolvedValue({
      name: '@pxlkit/effects',
      description: longOffTopic,
    });

    const ctx = makeCtx([
      {
        package: '@pxlkit/effects',
        path: path.join(repoRoot, 'packages/effects/package.json'),
      },
    ]);

    const gate = new ConsistencyPkgJsonGate();
    const result = await gate.run(ctx);

    expect(result.findings.some((f) => /exceeds/.test(f.message))).toBe(true);
    expect(
      result.findings.some((f) => /primary-category keyword/.test(f.message)),
    ).toBe(true);
  });

  it('records relative file paths in findings', async () => {
    mockedReadJson.mockResolvedValue({
      name: '@pxlkit/effects',
      // missing description triggers a finding
    });

    const ctx = makeCtx([
      {
        package: '@pxlkit/effects',
        path: path.join(repoRoot, 'packages/effects/package.json'),
      },
    ]);

    const gate = new ConsistencyPkgJsonGate();
    const result = await gate.run(ctx);

    expect(result.findings).toHaveLength(1);
    const f = result.findings[0];
    // posix or win32 separator depending on host — match both.
    expect(f.file?.replace(/\\/g, '/')).toBe('packages/effects/package.json');
  });

  it('emits an info finding when package.json fails to read', async () => {
    mockedReadJson.mockRejectedValue(new Error('ENOENT: gone'));

    const ctx = makeCtx([
      {
        package: '@pxlkit/effects',
        path: path.join(repoRoot, 'packages/effects/package.json'),
      },
    ]);

    const gate = new ConsistencyPkgJsonGate();
    const result = await gate.run(ctx);

    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('info');
    expect(result.findings[0].message).toMatch(/failed to read/);
  });

  it('returns ok with zero findings when there are no packages', async () => {
    const ctx = makeCtx([]);
    const gate = new ConsistencyPkgJsonGate();
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });
});
