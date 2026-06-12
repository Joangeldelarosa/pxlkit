/**
 * Tests for Gate 20 — theme-token-usage.
 *
 * Strategy: spin a tmp repo with a fake packages/ui-kit/src/ tree holding
 * one or two TSX files that contain mixed retro tokens, hardcoded colors,
 * and standard-Tailwind palette colors. Run the gate against the tmp root
 * and assert finding severities + suggestion content.
 */

import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { AuditContext } from '../../_lib/load-context.js';
import gate, {
  ThemeTokenUsageGate,
  classifyClassBody,
  extractColorClasses,
  scanFileSource,
  suggestionFor,
} from '../../gates/20-theme-token-usage.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'gate20-'));
});

afterEach(async () => {
  await fs.remove(tmpRoot);
});

async function writeUiKitFile(rel: string, contents: string): Promise<void> {
  const abs = path.join(tmpRoot, 'packages/ui-kit/src', rel);
  await fs.ensureDir(path.dirname(abs));
  await fs.writeFile(abs, contents, 'utf8');
}

function mockCtx(): AuditContext {
  return {
    repoRoot: tmpRoot,
    manifests: [],
    uiKitSrcDir: path.join(tmpRoot, 'packages/ui-kit/src'),
    appsWebSrcDir: path.join(tmpRoot, 'apps/web/src'),
    tokensFile: path.join(tmpRoot, 'packages/ui-kit/src/tokens.ts'),
    registryFile: path.join(tmpRoot, 'packages/ui-kit/src/registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [],
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

describe('extractColorClasses', () => {
  it('pulls bg/text/border/fill classes out of a className string', () => {
    const src = `
      function X() {
        return <div className="bg-retro-green text-retro-text border-retro-border fill-retro-cyan" />;
      }
    `;
    const classes = extractColorClasses(src);
    const bodies = classes.map((c) => `${c.prefix}-${c.body}`);
    expect(bodies).toEqual(
      expect.arrayContaining([
        'bg-retro-green',
        'text-retro-text',
        'border-retro-border',
        'fill-retro-cyan',
      ]),
    );
  });

  it('peels off variant chains (hover:, md:, dark:)', () => {
    const src = `const c = "hover:bg-retro-green md:text-retro-text dark:border-retro-border";`;
    const classes = extractColorClasses(src);
    const variants = classes.map((c) => c.variant);
    expect(variants).toEqual(
      expect.arrayContaining(['hover:', 'md:', 'dark:']),
    );
  });

  it('ignores strings that do not contain any color prefix', () => {
    const src = `const c = "flex items-center gap-2 rounded-lg p-2";`;
    const classes = extractColorClasses(src);
    expect(classes).toEqual([]);
  });
});

describe('classifyClassBody', () => {
  it('marks retro-* bodies as ok-retro and captures the alpha', () => {
    const v = classifyClassBody('bg', 'retro-green/18');
    expect(v).toEqual({ kind: 'ok-retro', toneSlug: 'green', alpha: '18' });
  });

  it('marks hex arbitrary values as hardcoded', () => {
    const v = classifyClassBody('text', '[#0EA5E9]');
    expect(v.kind).toBe('hardcoded');
  });

  it('marks rgb/hsl arbitrary values as hardcoded', () => {
    expect(classifyClassBody('bg', '[rgb(0,0,0)]').kind).toBe('hardcoded');
    expect(classifyClassBody('border', '[hsl(0,0%,100%)]').kind).toBe('hardcoded');
  });

  it('marks standard Tailwind palette colors as palette (major)', () => {
    const v = classifyClassBody('bg', 'gray-500');
    expect(v).toMatchObject({ kind: 'palette', palette: 'gray', shade: '500' });
    const v2 = classifyClassBody('text', 'blue-400');
    expect(v2).toMatchObject({ kind: 'palette', palette: 'blue', shade: '400' });
  });

  it('marks bare keyword colors as keyword-color', () => {
    expect(classifyClassBody('bg', 'black').kind).toBe('keyword-color');
    expect(classifyClassBody('text', 'white').kind).toBe('keyword-color');
  });

  it('skips structural utilities (bg-transparent, border-0, text-xs, bg-gradient-to-r)', () => {
    expect(classifyClassBody('bg', 'transparent').kind).toBe('skip');
    expect(classifyClassBody('bg', 'current').kind).toBe('skip');
    expect(classifyClassBody('border', '0').kind).toBe('skip');
    expect(classifyClassBody('border', '2').kind).toBe('skip');
    expect(classifyClassBody('text', 'xs').kind).toBe('skip');
    expect(classifyClassBody('text', 'left').kind).toBe('skip');
    expect(classifyClassBody('bg', 'gradient-to-r').kind).toBe('skip');
    expect(classifyClassBody('bg', 'clip-text').kind).toBe('skip');
    expect(classifyClassBody('border', 'r-transparent').kind).toBe('skip');
    expect(classifyClassBody('fill', 'current').kind).toBe('skip');
    expect(classifyClassBody('fill', 'none').kind).toBe('skip');
  });
});

describe('suggestionFor', () => {
  it('maps gray-500 → retro-neutral and includes tokens.ts hint', () => {
    const s = suggestionFor({
      variant: '',
      prefix: 'bg',
      verdict: { kind: 'palette', palette: 'gray', shade: '500', alpha: null },
    });
    expect(s).toContain('retro-neutral');
    expect(s).toContain('tokens.ts');
  });

  it('maps blue-400 → retro-cyan', () => {
    const s = suggestionFor({
      variant: '',
      prefix: 'text',
      verdict: { kind: 'palette', palette: 'blue', shade: '400', alpha: null },
    });
    expect(s).toContain('text-retro-cyan');
  });

  it('preserves variant chains in the replacement', () => {
    const s = suggestionFor({
      variant: 'hover:',
      prefix: 'bg',
      verdict: { kind: 'palette', palette: 'gray', shade: '700', alpha: null },
    });
    expect(s).toContain('hover:bg-retro-neutral');
  });

  it('hardcoded suggestion guides toward tokens.ts', () => {
    const s = suggestionFor({
      variant: '',
      prefix: 'text',
      verdict: { kind: 'hardcoded', reason: 'arbitrary color value [#0EA5E9]' },
    });
    expect(s).toContain('tokens.ts');
    expect(s).toContain('text-retro');
  });
});

describe('scanFileSource', () => {
  it('produces ZERO findings for a file that uses only retro tokens', () => {
    const src = `
      export const X = () => (
        <div className="bg-retro-green/18 text-retro-text border-retro-border fill-retro-cyan" />
      );
    `;
    const r = scanFileSource('packages/ui-kit/src/clean.tsx', src);
    expect(r.findings).toEqual([]);
    expect(r.blockerCount).toBe(0);
    expect(r.majorCount).toBe(0);
    expect(r.retroUsage['retro-green']).toBe(1);
    expect(r.retroUsage['retro-text']).toBe(1);
    expect(r.retroUsage['retro-border']).toBe(1);
    expect(r.retroUsage['retro-cyan']).toBe(1);
    expect(r.retroTotal).toBe(4);
  });

  it('flags hardcoded arbitrary color as blocker with file:line:col', () => {
    const src = `
      export const X = () => (
        <div className="bg-[#0EA5E9] text-retro-text" />
      );
    `;
    const r = scanFileSource('packages/ui-kit/src/leak.tsx', src);
    const blocker = r.findings.find((f) => f.severity === 'blocker');
    expect(blocker).toBeDefined();
    expect(blocker!.message).toContain('bg-[#0EA5E9]');
    expect(blocker!.message).toContain('packages/ui-kit/src/leak.tsx');
    expect(blocker!.suggestion).toContain('tokens.ts');
    expect(r.blockerCount).toBe(1);
  });

  it('flags standard Tailwind palette color as major and suggests retro tone', () => {
    const src = `
      export const X = () => (
        <div className="bg-gray-500 text-blue-400" />
      );
    `;
    const r = scanFileSource('packages/ui-kit/src/palette.tsx', src);
    const majors = r.findings.filter((f) => f.severity === 'major');
    expect(majors.length).toBe(2);
    expect(majors.some((m) => m.suggestion?.includes('retro-neutral'))).toBe(true);
    expect(majors.some((m) => m.suggestion?.includes('retro-cyan'))).toBe(true);
    expect(r.majorCount).toBe(2);
  });

  it('skips structural color utilities (gradient, transparent, sizes)', () => {
    const src = `
      export const X = () => (
        <div className="bg-transparent text-xs border-0 fill-current bg-gradient-to-r border-r-transparent" />
      );
    `;
    const r = scanFileSource('packages/ui-kit/src/struct.tsx', src);
    expect(r.findings).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Gate integration
// ---------------------------------------------------------------------------

describe('ThemeTokenUsageGate (integration)', () => {
  it('passes when all components use retro tokens', async () => {
    await writeUiKitFile(
      'pure.tsx',
      `export const X = () => <div className="bg-retro-cyan/18 text-retro-text border-retro-border" />;`,
    );

    const g = new ThemeTokenUsageGate();
    const r = await g.run(mockCtx());
    expect(r.passed).toBe(true);
    // The single info finding (the summary table) is allowed.
    const nonInfo = r.findings.filter((f) => f.severity !== 'info');
    expect(nonInfo).toEqual([]);
  });

  it('detects a known violation (KNOWN-VIOLATION fixture)', async () => {
    // KNOWN-VIOLATION FIXTURE: one component leaks `bg-[#fff]` (blocker) and
    // `text-gray-500` (major). This file is what the gate exists to catch.
    await writeUiKitFile(
      'violator.tsx',
      `
        export const Bad = () => (
          <div className="bg-[#fff] text-gray-500 border-retro-border" />
        );
      `,
    );

    const g = new ThemeTokenUsageGate();
    const r = await g.run(mockCtx());
    expect(r.passed).toBe(false);

    const blocker = r.findings.find((f) => f.severity === 'blocker');
    expect(blocker).toBeDefined();
    expect(blocker!.file).toContain('violator.tsx');
    expect(blocker!.message).toContain('bg-[#fff]');
    expect(blocker!.suggestion).toContain('tokens.ts');

    const major = r.findings.find((f) => f.severity === 'major');
    expect(major).toBeDefined();
    expect(major!.message).toContain('text-gray-500');
    expect(major!.suggestion).toContain('retro-neutral');

    // The summary payload (info) should be present and parseable.
    const summary = r.findings.find((f) => f.severity === 'info');
    expect(summary).toBeDefined();
    const parsed = JSON.parse(summary!.suggestion!) as {
      globalUsage: Record<string, number>;
      perFile: Array<{ file: string; retroTotal: number }>;
      filesScanned: number;
    };
    expect(parsed.filesScanned).toBe(1);
    expect(parsed.perFile[0]!.retroTotal).toBe(1); // border-retro-border
    expect(parsed.globalUsage['retro-border']).toBe(1);
  });

  it('ignores stories and tests', async () => {
    await writeUiKitFile(
      'real.tsx',
      `export const X = () => <div className="bg-retro-green" />;`,
    );
    await writeUiKitFile(
      'real.stories.tsx',
      `export const X = () => <div className="bg-[#fff]" />;`,
    );
    await writeUiKitFile(
      '__tests__/x.test.tsx',
      `export const X = () => <div className="bg-[#fff]" />;`,
    );

    const g = new ThemeTokenUsageGate();
    const r = await g.run(mockCtx());
    expect(r.passed).toBe(true);
  });

  it('ignores colocated *.examples.tsx demo snippets (doc collateral, not component impls)', async () => {
    // Same convention as gates 21/24/26: `<Component>.examples.tsx` files are
    // documentation demos (often showing the component on top of arbitrary
    // user content), NOT component implementations. They must not trip the
    // token gate.
    await writeUiKitFile(
      'cards/PixelRibbon.tsx',
      `export const PixelRibbon = () => <div className="bg-retro-green" />;`,
    );
    await writeUiKitFile(
      'cards/PixelRibbon.examples.tsx',
      `export const Default = () => <div className="border-white/20 bg-black/60 text-white bg-zinc-950" />;`,
    );

    const g = new ThemeTokenUsageGate();
    const r = await g.run(mockCtx());
    expect(r.passed).toBe(true);
    const nonInfo = r.findings.filter((f) => f.severity !== 'info');
    expect(nonInfo).toEqual([]);
  });

  it('still flags the identical violations when they live in a component impl (pin)', async () => {
    await writeUiKitFile(
      'cards/PixelRibbon.tsx',
      `export const PixelRibbon = () => <div className="border-white/20 bg-black/60 bg-zinc-950" />;`,
    );

    const g = new ThemeTokenUsageGate();
    const r = await g.run(mockCtx());
    expect(r.passed).toBe(false);
    const blockers = r.findings.filter((f) => f.severity === 'blocker');
    const majors = r.findings.filter((f) => f.severity === 'major');
    expect(blockers.length).toBe(2); // border-white/20, bg-black/60
    expect(majors.length).toBe(1); // bg-zinc-950
  });

  it('default-exported gate instance has id=20 and stable name', () => {
    expect(gate.id).toBe(20);
    expect(gate.name).toBe('theme-token-usage');
  });
});
