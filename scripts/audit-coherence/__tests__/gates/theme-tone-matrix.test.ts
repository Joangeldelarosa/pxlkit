/**
 * Tests for Gate 21 — theme-tone-matrix.
 *
 * Strategy: build a synthetic ui-kit src fixture in tmpdir (tokens.ts +
 * common.tsx + a couple of component files) and inject it into the gate via
 * a mocked AuditContext. We never touch the real packages/ui-kit sources.
 *
 * Coverage:
 *  - exposes id=21 and the canonical gate name
 *  - vacuous (impossible) — there's always a tokens.ts requirement; we test
 *    the missing-file blocker instead
 *  - clean PASS when tokens are well-formed and every component uses ToneKey
 *  - BLOCKER per missing sub-field on a tone entry
 *  - MAJOR pattern violations (wrong opacity, wrong color)
 *  - BLOCKER when the `Tone` alias is a partial union vs. the tone record
 *  - BLOCKER when a component tone?: prop is a partial inline union
 *  - MINOR when a component tone?: prop uses an unresolvable RHS
 *  - findings include actionable `suggestion` text
 */

import * as os from 'node:os';
import * as path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'fs-extra';

import ThemeToneMatrixGate, {
  TONE_REQUIRED_FIELDS,
  parseToneRecord,
  parseLiteralUnion,
  extractStringUnionAlias,
  checkToneCoverage,
} from '../../gates/21-theme-tone-matrix.js';
import type { AuditContext, Logger } from '../../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function silentLogger(): Logger {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  };
}

function ctxFor(repoRoot: string): AuditContext {
  const uiKitSrcDir = path.join(repoRoot, 'packages/ui-kit/src');
  return {
    repoRoot,
    manifests: [],
    uiKitSrcDir,
    appsWebSrcDir: path.join(repoRoot, 'apps/web/src'),
    tokensFile: path.join(uiKitSrcDir, 'tokens.ts'),
    registryFile: path.join(uiKitSrcDir, 'registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [],
    logger: silentLogger(),
  };
}

async function writeSrc(
  repoRoot: string,
  rel: string,
  body: string,
): Promise<void> {
  await fs.outputFile(
    path.join(repoRoot, 'packages/ui-kit/src', rel),
    body,
    'utf8',
  );
}

const GOOD_TOKENS = `
export const tone = {
  neutral: {
    border: 'border-retro-border',
    bg: 'bg-retro-surface/40',
    soft: 'bg-retro-surface/20',
    glow: 'shadow-[0_0_24px_-12px_rgba(0,0,0,0.4)]',
    ring: 'focus-visible:ring-retro-border',
    text: 'text-retro-text',
    fill: 'bg-retro-muted',
  },
  green: {
    border: 'border-retro-green/30',
    bg: 'bg-retro-green/18',
    soft: 'bg-retro-green/8',
    glow: 'shadow-[0_0_24px_-8px_rgba(0,255,128,0.45)]',
    ring: 'focus-visible:ring-retro-green/40',
    text: 'text-retro-green',
    fill: 'bg-retro-green',
  },
  cyan: {
    border: 'border-retro-cyan/30',
    bg: 'bg-retro-cyan/18',
    soft: 'bg-retro-cyan/8',
    glow: 'shadow-[0_0_24px_-8px_rgba(14,165,233,0.45)]',
    ring: 'focus-visible:ring-retro-cyan/40',
    text: 'text-retro-cyan',
    fill: 'bg-retro-cyan',
  },
} as const;

export type ToneKey = keyof typeof tone;
`;

const GOOD_COMMON = `
export type Tone = 'neutral' | 'green' | 'cyan';
`;

let tmp: string;

beforeEach(async () => {
  tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'theme-tone-matrix-'));
});

afterEach(async () => {
  await fs.remove(tmp).catch(() => undefined);
});

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

describe('ThemeToneMatrixGate — metadata', () => {
  it('exposes id=21 and the canonical name', () => {
    const gate = new ThemeToneMatrixGate();
    expect(gate.id).toBe(21);
    expect(gate.name).toBe('theme-tone-matrix');
    expect(gate.description.length).toBeGreaterThan(20);
  });

  it('exports the seven required tone fields in canonical order', () => {
    expect(TONE_REQUIRED_FIELDS).toEqual([
      'border',
      'bg',
      'soft',
      'glow',
      'ring',
      'text',
      'fill',
    ]);
  });
});

// ---------------------------------------------------------------------------
// parseToneRecord — unit
// ---------------------------------------------------------------------------

describe('parseToneRecord', () => {
  it('extracts every key and field from a well-formed tokens.ts', () => {
    const parsed = parseToneRecord(GOOD_TOKENS);
    expect(parsed.keys).toEqual(['neutral', 'green', 'cyan']);
    expect(parsed.entries.green).toEqual({
      border: 'border-retro-green/30',
      bg: 'bg-retro-green/18',
      soft: 'bg-retro-green/8',
      glow: 'shadow-[0_0_24px_-8px_rgba(0,255,128,0.45)]',
      ring: 'focus-visible:ring-retro-green/40',
      text: 'text-retro-green',
      fill: 'bg-retro-green',
    });
  });

  it('returns an empty record if the file does not declare `tone`', () => {
    const parsed = parseToneRecord('export const other = {} as const;');
    expect(parsed.keys).toEqual([]);
  });

  it('survives nested braces inside arbitrary-value class strings', () => {
    const source = `
      export const tone = {
        green: {
          glow: 'shadow-[0_0_24px_-8px_rgba(0,255,128,0.45)]',
          bg: 'bg-retro-green/18',
        },
      } as const;
    `;
    const parsed = parseToneRecord(source);
    expect(parsed.keys).toEqual(['green']);
    expect(parsed.entries.green?.glow).toContain('rgba(0,255,128,0.45)');
  });
});

// ---------------------------------------------------------------------------
// parseLiteralUnion + extractStringUnionAlias — unit
// ---------------------------------------------------------------------------

describe('parseLiteralUnion', () => {
  it('splits a simple union of string literals', () => {
    expect(parseLiteralUnion(`'a' | 'b' | 'c'`)).toEqual(['a', 'b', 'c']);
  });

  it('returns null for non-literal branches', () => {
    expect(parseLiteralUnion(`'a' | SomeType`)).toBeNull();
  });
});

describe('extractStringUnionAlias', () => {
  it('finds an exported type alias union', () => {
    const src = `export type Tone = 'a' | 'b';`;
    expect(extractStringUnionAlias(src, 'Tone')).toEqual(['a', 'b']);
  });

  it('returns null when the alias is missing', () => {
    expect(extractStringUnionAlias(`type Other = 'a';`, 'Tone')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// checkToneCoverage — unit
// ---------------------------------------------------------------------------

describe('checkToneCoverage', () => {
  const toneKeys = ['neutral', 'green', 'cyan'];

  it('accepts `ToneKey` as exhaustive by construction', () => {
    const result = checkToneCoverage('ToneKey', toneKeys, {
      toneUnionKeys: null,
      toneKeyIsKeyofTone: true,
      aliasFiles: [],
    });
    expect(result.ok).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it('flags a partial inline union with the missing keys', () => {
    const result = checkToneCoverage(`'green' | 'cyan'`, toneKeys, {
      toneUnionKeys: null,
      toneKeyIsKeyofTone: false,
      aliasFiles: [],
    });
    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(['neutral']);
    expect(result.kind).toBe('inline-union');
  });

  it('checks `Tone` against the resolved alias union', () => {
    const result = checkToneCoverage('Tone', toneKeys, {
      toneUnionKeys: ['green', 'cyan'],
      toneKeyIsKeyofTone: false,
      aliasFiles: [],
    });
    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(['neutral']);
    expect(result.kind).toBe('Tone-alias');
  });

  it('treats unresolvable RHS as unknown', () => {
    const result = checkToneCoverage('SomeRandomType', toneKeys, {
      toneUnionKeys: null,
      toneKeyIsKeyofTone: false,
      aliasFiles: [],
    });
    expect(result.ok).toBe(false);
    expect(result.kind).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// Gate integration — happy path
// ---------------------------------------------------------------------------

describe('ThemeToneMatrixGate — integration', () => {
  it('passes when tokens are well-formed and every prop uses ToneKey', async () => {
    await writeSrc(tmp, 'tokens.ts', GOOD_TOKENS);
    await writeSrc(tmp, 'common.tsx', GOOD_COMMON);
    await writeSrc(
      tmp,
      'feedback.tsx',
      `
        import type { ToneKey } from './tokens';
        export interface PixelToastProps {
          tone?: ToneKey;
        }
        export function PixelToast(_p: PixelToastProps) { return null; }
      `,
    );

    const result = await new ThemeToneMatrixGate().run(ctxFor(tmp));
    expect(result.name).toBe('theme-tone-matrix');
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  // -----------------------------------------------------------------------
  // Tokens: missing sub-field → BLOCKER
  // -----------------------------------------------------------------------

  it('emits a BLOCKER per missing sub-field on a tone entry', async () => {
    const BAD = `
      export const tone = {
        green: {
          border: 'border-retro-green/30',
          bg: 'bg-retro-green/18',
          soft: 'bg-retro-green/8',
          glow: 'shadow-[0_0_24px_-8px_rgba(0,255,128,0.45)]',
          ring: 'focus-visible:ring-retro-green/40',
          text: 'text-retro-green',
          // fill missing
        },
      } as const;
      export type ToneKey = keyof typeof tone;
    `;
    await writeSrc(tmp, 'tokens.ts', BAD);
    await writeSrc(tmp, 'common.tsx', `export type Tone = 'green';`);

    const result = await new ThemeToneMatrixGate().run(ctxFor(tmp));
    expect(result.passed).toBe(false);
    const blockers = result.findings.filter((f) => f.severity === 'blocker');
    expect(blockers.length).toBeGreaterThanOrEqual(1);
    const missingFillFinding = blockers.find((f) =>
      f.message.includes('Missing sub-field `fill`'),
    );
    expect(missingFillFinding).toBeDefined();
    expect(missingFillFinding?.component).toBe('tone.green');
    expect(missingFillFinding?.suggestion).toContain('bg-retro-green');
  });

  // -----------------------------------------------------------------------
  // Tokens: pattern violation → MAJOR
  // -----------------------------------------------------------------------

  it('emits a MAJOR finding on wrong-opacity / wrong-color pattern', async () => {
    const BAD = `
      export const tone = {
        green: {
          border: 'border-retro-green/30',
          bg: 'bg-retro-green/25',
          soft: 'bg-retro-cyan/8',
          glow: 'shadow-[0_0_24px_-8px_rgba(0,255,128,0.45)]',
          ring: 'focus-visible:ring-retro-green/40',
          text: 'text-retro-green',
          fill: 'bg-retro-green',
        },
      } as const;
      export type ToneKey = keyof typeof tone;
    `;
    await writeSrc(tmp, 'tokens.ts', BAD);
    await writeSrc(tmp, 'common.tsx', `export type Tone = 'green';`);

    const result = await new ThemeToneMatrixGate().run(ctxFor(tmp));
    expect(result.passed).toBe(false);

    const bgFinding = result.findings.find(
      (f) => f.component === 'tone.green.bg',
    );
    expect(bgFinding?.severity).toBe('major');
    expect(bgFinding?.message).toMatch(/bg-retro-green\/18/);
    expect(bgFinding?.suggestion).toContain('bg-retro-green/18');

    const softFinding = result.findings.find(
      (f) => f.component === 'tone.green.soft',
    );
    expect(softFinding?.severity).toBe('major');
    expect(softFinding?.message).toMatch(/bg-retro-green\/8/);
  });

  // -----------------------------------------------------------------------
  // Tone alias mismatched vs tone record → BLOCKER
  // -----------------------------------------------------------------------

  it('emits a BLOCKER when `Tone` alias does not cover all tone keys', async () => {
    await writeSrc(tmp, 'tokens.ts', GOOD_TOKENS);
    // GOOD_TOKENS has neutral|green|cyan but the alias only has green|cyan.
    await writeSrc(
      tmp,
      'common.tsx',
      `export type Tone = 'green' | 'cyan';`,
    );

    const result = await new ThemeToneMatrixGate().run(ctxFor(tmp));
    expect(result.passed).toBe(false);
    const finding = result.findings.find((f) => f.component === 'Tone');
    expect(finding).toBeDefined();
    expect(finding?.severity).toBe('blocker');
    expect(finding?.message).toMatch(/"neutral"/);
    expect(finding?.suggestion).toContain("'neutral'");
  });

  // -----------------------------------------------------------------------
  // Component prop: partial inline union → BLOCKER
  // -----------------------------------------------------------------------

  it('emits a BLOCKER when a component tone?: is a partial inline union', async () => {
    await writeSrc(tmp, 'tokens.ts', GOOD_TOKENS);
    await writeSrc(tmp, 'common.tsx', GOOD_COMMON);
    await writeSrc(
      tmp,
      'feedback.tsx',
      `
        export interface PixelBadgeProps {
          tone?: 'green' | 'cyan';
        }
        export function PixelBadge(_p: PixelBadgeProps) { return null; }
      `,
    );

    const result = await new ThemeToneMatrixGate().run(ctxFor(tmp));
    expect(result.passed).toBe(false);
    const finding = result.findings.find(
      (f) => f.component === 'PixelBadgeProps' || f.component === 'PixelBadge',
    );
    expect(finding).toBeDefined();
    expect(finding?.severity).toBe('blocker');
    expect(finding?.message).toMatch(/"neutral"/);
    expect(finding?.suggestion).toMatch(/ToneKey|'neutral'/);
  });

  // -----------------------------------------------------------------------
  // Component prop: unresolvable RHS → MINOR
  // -----------------------------------------------------------------------

  it('emits a MINOR finding when a tone?: prop uses an unresolvable type', async () => {
    await writeSrc(tmp, 'tokens.ts', GOOD_TOKENS);
    await writeSrc(tmp, 'common.tsx', GOOD_COMMON);
    await writeSrc(
      tmp,
      'feedback.tsx',
      `
        export interface PixelMysteryProps {
          tone?: SomeBrandedTone;
        }
      `,
    );

    const result = await new ThemeToneMatrixGate().run(ctxFor(tmp));
    const finding = result.findings.find((f) => f.severity === 'minor');
    expect(finding).toBeDefined();
    expect(finding?.message).toMatch(/Could not statically verify/);
  });

  // -----------------------------------------------------------------------
  // Tokens.ts missing → BLOCKER (gate cannot run)
  // -----------------------------------------------------------------------

  it('emits a BLOCKER when tokens.ts is missing entirely', async () => {
    // No tokens.ts written.
    await writeSrc(tmp, 'common.tsx', GOOD_COMMON);

    const result = await new ThemeToneMatrixGate().run(ctxFor(tmp));
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('blocker');
    expect(result.findings[0].message).toMatch(/tokens\.ts/);
  });

  // -----------------------------------------------------------------------
  // duration_ms contract
  // -----------------------------------------------------------------------

  it('always reports a non-negative duration_ms', async () => {
    await writeSrc(tmp, 'tokens.ts', GOOD_TOKENS);
    await writeSrc(tmp, 'common.tsx', GOOD_COMMON);
    const result = await new ThemeToneMatrixGate().run(ctxFor(tmp));
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });
});
