/**
 * Tests for 27-tsdoc-coverage.ts
 *
 * Strategy: feed synthetic TypeScript sources through the gate via the
 * `readSource` + `discoverSources` injection points so we never touch the
 * real filesystem. The fixture below contains a known violation (one
 * undocumented optional field) plus a documented field plus a non-Props
 * interface that MUST be ignored.
 *
 * We verify:
 *   - identity (id=27, name, description)
 *   - detection of an undocumented field → INFO finding with actionable
 *     suggestion containing a TSDoc skeleton
 *   - documented fields are NOT flagged as missing
 *   - non-Props interfaces are ignored entirely
 *   - non-exported Props interfaces are ignored (private surface)
 *   - type-alias-with-object-literal Props is supported
 *   - per-component coverage percent is computed correctly
 *   - aggregate matrix matches per-row totals
 *   - the gate ALWAYS reports passed=true (INFO-only contract)
 *   - vacuous pass when no sources discovered
 *   - extractFieldsFromSource is a pure function callable in isolation
 *   - leading `//` comments DO NOT count as TSDoc
 *   - leading plain `/* *\/` (single-asterisk) block comments DO NOT count
 */

import * as os from 'node:os';
import * as path from 'node:path';

import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  TsdocCoverageGate,
  aggregateCoverage,
  extractFieldsFromSource,
} from '../../gates/27-tsdoc-coverage.js';
import type { AuditContext, Logger } from '../../_lib/load-context.js';

// ---------------------------------------------------------------------------
// Fixtures
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

/**
 * Synthetic source with a KNOWN violation: `size` is undocumented.
 * `tone` IS documented with a clean TSDoc block.
 * `InternalProps` is NOT exported — must be ignored.
 * `Helpers` is not a Props surface — must be ignored.
 */
const BUTTON_SRC = `
import * as React from 'react';

/** A non-Props interface that must be ignored entirely. */
export interface Helpers {
  mergeRefs(): void;
}

interface InternalProps {
  // not exported — must be ignored
  secret: boolean;
}

export interface PixelButtonProps {
  /** Visual tone of the button (green, red, blue, ...). */
  tone?: 'green' | 'red' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  // single-line comment — does NOT count as TSDoc
  loading?: boolean;
  /* plain block comment — does NOT count as TSDoc */
  fullWidth?: boolean;
  /**
   * Render children as the root element (Radix Slot pattern). Expects a
   * single child element.
   */
  asChild?: boolean;
}
`;

const TYPE_ALIAS_SRC = `
/**
 * Public alias-style props.
 */
export type CardProps = {
  /** Header text. */
  title: string;
  subtitle?: string;
};
`;

const NO_PROPS_SRC = `
export interface NotPropsAtAll {
  /** ignored */
  foo: string;
}
`;

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tsdoc-coverage-test-'));
});

afterEach(async () => {
  await fs.remove(tmpRoot).catch(() => undefined);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TsdocCoverageGate', () => {
  it('identifies itself with id=27 and the canonical name', () => {
    const gate = new TsdocCoverageGate();
    expect(gate.id).toBe(27);
    expect(gate.name).toBe('tsdoc-coverage');
    expect(gate.description.length).toBeGreaterThan(20);
  });

  it('passes vacuously when no sources discovered', async () => {
    const ctx = await makeCtx(tmpRoot);
    const gate = new TsdocCoverageGate({
      discoverSources: async () => [],
      readSource: async () => '',
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.name).toBe('tsdoc-coverage');
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
    // The aggregate summary finding is always emitted, even for empty input.
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('info');
    expect(result.findings[0].message).toMatch(/0\/0/);
  });

  it('detects undocumented fields and emits an actionable suggestion', async () => {
    const ctx = await makeCtx(tmpRoot);
    const buttonPath = path.join(tmpRoot, 'packages/ui-kit/src/button.tsx');
    const gate = new TsdocCoverageGate({
      discoverSources: async () => [buttonPath],
      readSource: async () => BUTTON_SRC,
    });
    const result = await gate.run(ctx);

    expect(result.passed).toBe(true); // INFO-only contract

    // Findings should include: aggregate summary + per-row summary + one INFO
    // per undocumented field (size, loading, fullWidth).
    const fieldFindings = result.findings.filter(
      (f) =>
        f.message.includes('PixelButtonProps.') &&
        f.message.includes('no TSDoc'),
    );
    const fieldNames = fieldFindings
      .map((f) => f.message.match(/PixelButtonProps\.(\w+)/)?.[1])
      .filter(Boolean);
    expect(fieldNames).toContain('size');
    expect(fieldNames).toContain('loading');
    expect(fieldNames).toContain('fullWidth');
    expect(fieldNames).not.toContain('tone');
    expect(fieldNames).not.toContain('asChild');

    // Suggestion must be an actionable TSDoc skeleton, not generic prose.
    const sizeFinding = fieldFindings.find((f) =>
      f.message.includes('PixelButtonProps.size'),
    );
    expect(sizeFinding).toBeDefined();
    expect(sizeFinding!.suggestion).toMatch(/\/\*\*/);
    expect(sizeFinding!.suggestion).toMatch(/\*\//);
    expect(sizeFinding!.suggestion).toMatch(/size\?:/);
    expect(sizeFinding!.suggestion).toMatch(/@default/); // optional → @default hint
    expect(sizeFinding!.file).toMatch(/button\.tsx:\d+/);
    expect(sizeFinding!.component).toBe('button');
  });

  it('ignores non-Props interfaces and non-exported Props interfaces', async () => {
    const ctx = await makeCtx(tmpRoot);
    const buttonPath = path.join(tmpRoot, 'packages/ui-kit/src/button.tsx');
    const gate = new TsdocCoverageGate({
      discoverSources: async () => [buttonPath],
      readSource: async () => BUTTON_SRC,
    });
    const result = await gate.run(ctx);
    // None of the findings should mention `Helpers` or `InternalProps`.
    for (const f of result.findings) {
      expect(f.message).not.toMatch(/Helpers/);
      expect(f.message).not.toMatch(/InternalProps/);
      expect(f.message).not.toMatch(/\bsecret\b/);
      expect(f.message).not.toMatch(/mergeRefs/);
    }
  });

  it('supports type-alias-with-object-literal Props', async () => {
    const ctx = await makeCtx(tmpRoot);
    const cardPath = path.join(tmpRoot, 'packages/ui-kit/src/card.tsx');
    const gate = new TsdocCoverageGate({
      discoverSources: async () => [cardPath],
      readSource: async () => TYPE_ALIAS_SRC,
    });
    const matrix = await gate.analyse(ctx);
    expect(matrix.perComponent).toHaveLength(1);
    const row = matrix.perComponent[0];
    expect(row.propsName).toBe('CardProps');
    expect(row.totalFields).toBe(2);
    expect(row.documentedFields).toBe(1); // only `title` has TSDoc
    expect(row.percent).toBe(50);
  });

  it('aggregate matrix matches per-row totals', async () => {
    const ctx = await makeCtx(tmpRoot);
    const buttonPath = path.join(tmpRoot, 'packages/ui-kit/src/button.tsx');
    const cardPath = path.join(tmpRoot, 'packages/ui-kit/src/card.tsx');
    const gate = new TsdocCoverageGate({
      discoverSources: async () => [buttonPath, cardPath],
      readSource: async (file) =>
        file === buttonPath ? BUTTON_SRC : TYPE_ALIAS_SRC,
    });
    const matrix = await gate.analyse(ctx);
    const summedTotal = matrix.perComponent.reduce(
      (s, r) => s + r.totalFields,
      0,
    );
    const summedDocs = matrix.perComponent.reduce(
      (s, r) => s + r.documentedFields,
      0,
    );
    expect(matrix.totalFields).toBe(summedTotal);
    expect(matrix.documentedFields).toBe(summedDocs);
    expect(matrix.overallPercent).toBe(
      Math.round((summedDocs / summedTotal) * 100),
    );
  });

  it('skips files that contain no Props surfaces', async () => {
    const ctx = await makeCtx(tmpRoot);
    const otherPath = path.join(tmpRoot, 'packages/ui-kit/src/other.tsx');
    const gate = new TsdocCoverageGate({
      discoverSources: async () => [otherPath],
      readSource: async () => NO_PROPS_SRC,
    });
    const matrix = await gate.analyse(ctx);
    expect(matrix.perComponent).toEqual([]);
    expect(matrix.totalFields).toBe(0);
    expect(matrix.documentedFields).toBe(0);
    expect(matrix.overallPercent).toBe(100); // vacuous
  });

  it('survives unreadable files without crashing the gate', async () => {
    const ctx = await makeCtx(tmpRoot);
    const okPath = path.join(tmpRoot, 'packages/ui-kit/src/card.tsx');
    const badPath = path.join(tmpRoot, 'packages/ui-kit/src/bad.tsx');
    const gate = new TsdocCoverageGate({
      discoverSources: async () => [badPath, okPath],
      readSource: async (file) => {
        if (file === badPath) throw new Error('EACCES');
        return TYPE_ALIAS_SRC;
      },
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    // Card row should still be present despite bad file.
    const cardRow = result.findings.find((f) =>
      f.message.startsWith('CardProps:'),
    );
    expect(cardRow).toBeDefined();
  });

  it('always reports passed=true (INFO-only contract)', async () => {
    const ctx = await makeCtx(tmpRoot);
    const buttonPath = path.join(tmpRoot, 'packages/ui-kit/src/button.tsx');
    const gate = new TsdocCoverageGate({
      discoverSources: async () => [buttonPath],
      readSource: async () => BUTTON_SRC,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    // Even though several fields are undocumented, no finding is blocker/major.
    for (const f of result.findings) {
      expect(f.severity).toBe('info');
    }
  });

  it('emits an aggregate summary as the first finding', async () => {
    const ctx = await makeCtx(tmpRoot);
    const buttonPath = path.join(tmpRoot, 'packages/ui-kit/src/button.tsx');
    const gate = new TsdocCoverageGate({
      discoverSources: async () => [buttonPath],
      readSource: async () => BUTTON_SRC,
    });
    const result = await gate.run(ctx);
    expect(result.findings.length).toBeGreaterThan(0);
    const first = result.findings[0];
    expect(first.severity).toBe('info');
    expect(first.message).toMatch(/Overall TSDoc coverage:/);
    expect(first.message).toMatch(/\d+\/\d+/);
    expect(first.message).toMatch(/\d+%/);
  });
});

describe('extractFieldsFromSource (pure)', () => {
  it('returns the expected field set for a Props interface', () => {
    const fields = extractFieldsFromSource('/v/button.tsx', BUTTON_SRC);
    const names = fields.map((f) => f.name).sort();
    expect(names).toEqual(['asChild', 'fullWidth', 'loading', 'size', 'tone']);
    const tone = fields.find((f) => f.name === 'tone')!;
    expect(tone.hasTsdoc).toBe(true);
    expect(tone.optional).toBe(true);
    expect(tone.propsName).toBe('PixelButtonProps');
    expect(tone.component).toBe('button');
    const size = fields.find((f) => f.name === 'size')!;
    expect(size.hasTsdoc).toBe(false);
    const loading = fields.find((f) => f.name === 'loading')!;
    expect(loading.hasTsdoc).toBe(false); // // is not TSDoc
    const fullWidth = fields.find((f) => f.name === 'fullWidth')!;
    expect(fullWidth.hasTsdoc).toBe(false); // /* */ is not TSDoc
  });

  it('captures the type text for the actionable suggestion', () => {
    const fields = extractFieldsFromSource('/v/card.tsx', TYPE_ALIAS_SRC);
    const title = fields.find((f) => f.name === 'title')!;
    expect(title.typeText).toBe('string');
    expect(title.optional).toBe(false);
    const sub = fields.find((f) => f.name === 'subtitle')!;
    expect(sub.typeText).toBe('string');
    expect(sub.optional).toBe(true);
  });
});

describe('aggregateCoverage (pure)', () => {
  it('groups fields by file+propsName and computes percent', () => {
    const fields = extractFieldsFromSource('/v/button.tsx', BUTTON_SRC);
    const matrix = aggregateCoverage(fields);
    expect(matrix.perComponent).toHaveLength(1);
    const row = matrix.perComponent[0];
    expect(row.totalFields).toBe(5);
    expect(row.documentedFields).toBe(2); // tone + asChild
    expect(row.percent).toBe(40);
    expect(matrix.overallPercent).toBe(40);
  });

  it('rounds vacuous (0-field) Props to 100%', () => {
    const matrix = aggregateCoverage([]);
    expect(matrix.overallPercent).toBe(100);
    expect(matrix.perComponent).toEqual([]);
  });
});
