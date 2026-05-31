/**
 * Unit tests for Gate 24 — prop-naming-vocabulary.
 *
 * The gate is filesystem-agnostic via the `discoverFiles` + `readSource`
 * injection points. All fixtures are inline source strings — no temp dirs,
 * no real I/O, so the suite stays under 100ms.
 */

import * as path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import type { AuditContext, Logger } from '../../_lib/load-context.js';
import gate, {
  CANONICAL_VOCABULARY,
  PropNamingVocabularyGate,
  analyseSource,
  discoverSourceFiles,
  extractPropDeclarations,
  extractPropsBlocks,
  isHeadingLikeContext,
  isNativeHtmlTypeUnion,
  isRhfContext,
} from '../../gates/24-prop-naming-vocabulary.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const repoRoot = path.resolve('/virtual/repo').replace(/\\/g, '/');
const uiKitSrc = `${repoRoot}/packages/ui-kit/src`;

function silentLogger(): Logger {
  return {
    info: () => {},
    warn: () => {},
    error: () => {},
    debug: () => {},
  };
}

function makeCtx(): AuditContext {
  return {
    repoRoot,
    manifests: [],
    uiKitSrcDir: uiKitSrc,
    appsWebSrcDir: `${repoRoot}/apps/web/src`,
    tokensFile: `${uiKitSrc}/tokens.ts`,
    registryFile: `${uiKitSrc}/registry.ts`,
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [],
    logger: silentLogger(),
  };
}

function runGateOn(
  files: Record<string, string>,
): ReturnType<PropNamingVocabularyGate['run']> {
  const ctx = makeCtx();
  const g = new PropNamingVocabularyGate({
    discoverFiles: async () => Object.keys(files),
    readSource: async (f) => {
      const body = files[f];
      if (body === undefined) throw new Error(`missing fixture ${f}`);
      return body;
    },
  });
  return g.run(ctx);
}

// ---------------------------------------------------------------------------
// Metadata contract
// ---------------------------------------------------------------------------

describe('PropNamingVocabularyGate — metadata', () => {
  it('exposes id 24 and the canonical name', () => {
    const g = new PropNamingVocabularyGate();
    expect(g.id).toBe(24);
    expect(g.name).toBe('prop-naming-vocabulary');
    expect(g.description.toLowerCase()).toContain('canonical');
    expect(g.description.toLowerCase()).toContain('major');
  });

  it('default export is a singleton with the same contract', () => {
    expect(gate.id).toBe(24);
    expect(gate.name).toBe('prop-naming-vocabulary');
    expect(typeof gate.run).toBe('function');
  });

  it('ships a non-empty canonical vocabulary covering the headline rules', () => {
    const canonicals = CANONICAL_VOCABULARY.map((r) => r.canonical);
    for (const k of [
      'tone',
      'size',
      'variant',
      'surface',
      'disabled',
      'loading',
      'onChange',
      'value',
      'defaultValue',
      'label',
    ]) {
      expect(canonicals).toContain(k);
    }
  });
});

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe('isNativeHtmlTypeUnion', () => {
  it('returns true for a button-type union with ≥2 native literals', () => {
    expect(
      isNativeHtmlTypeUnion(`type?: 'button' | 'submit' | 'reset';`),
    ).toBe(true);
  });

  it('returns false for a single-literal type (likely a variant marker)', () => {
    expect(isNativeHtmlTypeUnion(`type?: 'primary';`)).toBe(false);
  });

  it('returns false when the prop carries arbitrary identifiers, not native literals', () => {
    expect(
      isNativeHtmlTypeUnion(`type?: 'banner' | 'splash' | 'modal';`),
    ).toBe(false);
  });
});

describe('isHeadingLikeContext', () => {
  it('exempts files whose basename contains a heading hint', () => {
    expect(isHeadingLikeContext('/foo/PixelModal.tsx', '')).toBe(true);
    expect(isHeadingLikeContext('/foo/PixelHeading.tsx', '')).toBe(true);
    expect(isHeadingLikeContext('/foo/PixelDialog.tsx', '')).toBe(true);
  });

  it('exempts when the Props block exposes subtitle/description/level', () => {
    expect(
      isHeadingLikeContext('/foo/PixelCard.tsx', `title?: string;\nsubtitle?: string;`),
    ).toBe(true);
    expect(
      isHeadingLikeContext('/foo/PixelCard.tsx', `title?: string;\ndescription?: string;`),
    ).toBe(true);
    expect(
      isHeadingLikeContext(
        '/foo/PixelCard.tsx',
        `title?: string;\nlevel?: 1 | 2 | 3;`,
      ),
    ).toBe(true);
  });

  it('does NOT exempt arbitrary cards / non-heading components', () => {
    expect(
      isHeadingLikeContext('/foo/PixelButton.tsx', `title?: string;`),
    ).toBe(false);
  });
});

describe('isRhfContext', () => {
  it('detects react-hook-form imports', () => {
    expect(isRhfContext(`import { useForm } from 'react-hook-form';`)).toBe(
      true,
    );
    expect(isRhfContext(`import x from "@hookform/resolvers/zod";`)).toBe(true);
  });

  it('rejects unrelated imports', () => {
    expect(isRhfContext(`import React from 'react';`)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Props block extraction
// ---------------------------------------------------------------------------

describe('extractPropsBlocks', () => {
  it('finds an interface Props block', () => {
    const src = `
export interface PixelButtonProps {
  color?: string;
  size?: 'sm' | 'md';
}
`;
    const blocks = extractPropsBlocks(src);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].name).toBe('PixelButtonProps');
    expect(blocks[0].body).toContain('color');
  });

  it('finds a type alias Props block', () => {
    const src = `export type PixelBadgeProps = { color?: string };\n`;
    const blocks = extractPropsBlocks(src);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].name).toBe('PixelBadgeProps');
  });

  it('handles nested braces correctly', () => {
    const src = `
export interface PixelMenuProps {
  items: { label: string; icon: { name: string } }[];
  color?: string;
}
`;
    const blocks = extractPropsBlocks(src);
    expect(blocks).toHaveLength(1);
    // The brace-balanced extractor MUST capture the full body.
    expect(blocks[0].body).toContain('items');
    expect(blocks[0].body).toContain('color');
  });

  it('ignores non-Props interfaces', () => {
    const src = `interface InternalState { foo: string }\nexport interface PixelXProps { color?: string }`;
    const blocks = extractPropsBlocks(src);
    expect(blocks.map((b) => b.name)).toEqual(['PixelXProps']);
  });
});

describe('extractPropDeclarations', () => {
  it('captures top-level props with optional markers', () => {
    const body = `
  color?: string;
  size: 'sm' | 'md';
  readonly disabled?: boolean;
`;
    const props = extractPropDeclarations(body, 10);
    const names = props.map((p) => p.name);
    expect(names).toContain('color');
    expect(names).toContain('size');
    expect(names).toContain('disabled');
  });

  it('captures bracketed string props', () => {
    const body = `  ['data-testid']?: string;\n`;
    const props = extractPropDeclarations(body, 5);
    expect(props.map((p) => p.name)).toEqual(['data-testid']);
  });

  it('skips nested object-type literal fields', () => {
    const body = `
  outer?: {
    inner: string;
    color: string;
  };
  size: 'sm';
`;
    const props = extractPropDeclarations(body, 1);
    // `inner` and the nested `color` are NOT top-level props of the
    // component, so they must NOT surface.
    expect(props.map((p) => p.name)).toEqual(['outer', 'size']);
  });

  it('produces 1-based absolute line numbers', () => {
    const body = `\n  color?: string;\n`;
    const props = extractPropDeclarations(body, 100);
    expect(props).toHaveLength(1);
    expect(props[0].line).toBeGreaterThan(100);
  });
});

// ---------------------------------------------------------------------------
// analyseSource — the core rule engine
// ---------------------------------------------------------------------------

describe('analyseSource', () => {
  it('flags `color` as a vocabulary violation (canonical "tone")', () => {
    const file = '/x/PixelButton.tsx';
    const src = `
export interface PixelButtonProps {
  color?: 'red' | 'blue';
  size?: 'sm' | 'md';
}
`;
    const v = analyseSource(file, src);
    expect(v).toHaveLength(1);
    expect(v[0].propName).toBe('color');
    expect(v[0].canonical).toBe('tone');
    expect(v[0].intent).toMatch(/visual mood/);
    expect(v[0].component).toBe('PixelButton');
    expect(v[0].propsInterface).toBe('PixelButtonProps');
  });

  it('flags multiple distinct aliases on the same Props block', () => {
    const src = `
export interface PixelInputProps {
  color?: string;
  scale?: number;
  kind?: 'A' | 'B';
  mode?: 'pixel' | 'linear';
  inactive?: boolean;
  busy?: boolean;
  onUpdate?: (v: string) => void;
  currentValue?: string;
  initialValue?: string;
}
`;
    const v = analyseSource('/x/PixelInput.tsx', src);
    const names = v.map((x) => x.propName).sort();
    expect(names).toEqual(
      [
        'busy',
        'color',
        'currentValue',
        'inactive',
        'initialValue',
        'kind',
        'mode',
        'onUpdate',
        'scale',
      ].sort(),
    );
  });

  it('passes on a Props block using only canonical names', () => {
    const src = `
export interface PixelButtonProps {
  tone?: 'primary' | 'danger';
  size?: 'sm' | 'md';
  variant?: 'solid' | 'ghost';
  surface?: 'pixel' | 'linear';
  disabled?: boolean;
  loading?: boolean;
  onChange?: (v: string) => void;
  value?: string;
  defaultValue?: string;
  label?: string;
}
`;
    expect(analyseSource('/x/PixelButton.tsx', src)).toEqual([]);
  });

  it('exempts native HTML input-type unions for `type`', () => {
    const src = `
export interface PixelButtonProps {
  type?: 'button' | 'submit' | 'reset';
}
`;
    expect(analyseSource('/x/PixelButton.tsx', src)).toEqual([]);
  });

  it('flags `type` when it carries arbitrary visual-variant literals', () => {
    const src = `
export interface PixelBannerProps {
  type?: 'info' | 'warning' | 'success';
}
`;
    const v = analyseSource('/x/PixelBanner.tsx', src);
    expect(v).toHaveLength(1);
    expect(v[0].propName).toBe('type');
    expect(v[0].canonical).toBe('variant');
  });

  it('exempts `title` on heading-like component files', () => {
    const src = `
export interface PixelHeadingProps {
  title?: string;
}
`;
    expect(analyseSource('/x/PixelHeading.tsx', src)).toEqual([]);
  });

  it('flags `title` on non-heading components', () => {
    const src = `
export interface PixelButtonProps {
  title?: string;
}
`;
    const v = analyseSource('/x/PixelButton.tsx', src);
    expect(v).toHaveLength(1);
    expect(v[0].propName).toBe('title');
    expect(v[0].canonical).toBe('label');
  });

  it('exempts `onValueChange` when the file imports react-hook-form', () => {
    const src = `
import { useForm } from 'react-hook-form';
export interface PixelFormFieldProps {
  onValueChange?: (v: string) => void;
}
`;
    expect(analyseSource('/x/PixelFormField.tsx', src)).toEqual([]);
  });

  it('flags `onValueChange` when the file does NOT use react-hook-form', () => {
    const src = `
import React from 'react';
export interface PixelToggleProps {
  onValueChange?: (v: boolean) => void;
}
`;
    const v = analyseSource('/x/PixelToggle.tsx', src);
    expect(v).toHaveLength(1);
    expect(v[0].propName).toBe('onValueChange');
    expect(v[0].canonical).toBe('onChange');
  });

  it('skips universally-exempt React-native props (children, className, id, …)', () => {
    const src = `
export interface PixelXProps {
  children?: React.ReactNode;
  className?: string;
  id?: string;
  name?: string;
  tabIndex?: number;
  role?: string;
}
`;
    expect(analyseSource('/x/PixelX.tsx', src)).toEqual([]);
  });

  it('skips aria-* and data-* bracketed props', () => {
    const src = `
export interface PixelXProps {
  ['aria-label']?: string;
  ['data-testid']?: string;
}
`;
    expect(analyseSource('/x/PixelX.tsx', src)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Gate.run() — end-to-end against injected fixtures
// ---------------------------------------------------------------------------

describe('PropNamingVocabularyGate.run', () => {
  it('passes vacuously when no source files are discovered', async () => {
    const ctx = makeCtx();
    const g = new PropNamingVocabularyGate({
      discoverFiles: async () => [],
      readSource: async () => {
        throw new Error('should not be called');
      },
    });
    const r = await g.run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
    expect(r.name).toBe('prop-naming-vocabulary');
    expect(typeof r.duration_ms).toBe('number');
  });

  it('passes when every file uses canonical vocabulary', async () => {
    const r = await runGateOn({
      [`${uiKitSrc}/PixelButton.tsx`]: `
export interface PixelButtonProps {
  tone?: 'primary' | 'danger';
  size?: 'sm' | 'md';
}
`,
    });
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
  });

  it('fails (major) on a known violation — `color` instead of `tone`', async () => {
    const file = `${uiKitSrc}/PixelButton.tsx`;
    const r = await runGateOn({
      [file]: `
export interface PixelButtonProps {
  color?: 'red' | 'blue';
  size?: 'sm' | 'md';
}
`,
    });
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(1);
    const f = r.findings[0]!;
    expect(f.severity).toBe('major');
    expect(f.component).toBe('PixelButton');
    expect(f.file).toBe(file);
    expect(f.message).toContain('color');
    expect(f.message).toContain('tone');
    expect(f.suggestion).toBeTruthy();
    expect(f.suggestion!).toContain('Rename "color" to "tone"');
    expect(f.suggestion!).toContain('PixelButton');
  });

  it('aggregates findings across multiple files', async () => {
    const r = await runGateOn({
      [`${uiKitSrc}/PixelButton.tsx`]: `
export interface PixelButtonProps {
  color?: string;
}
`,
      [`${uiKitSrc}/PixelBadge.tsx`]: `
export interface PixelBadgeProps {
  scale?: number;
}
`,
      [`${uiKitSrc}/PixelOk.tsx`]: `
export interface PixelOkProps {
  tone?: string;
  size?: string;
}
`,
    });
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(2);
    const comps = r.findings.map((f) => f.component).sort();
    expect(comps).toEqual(['PixelBadge', 'PixelButton']);
  });

  it('tolerates unreadable source files without crashing the run', async () => {
    const file = `${uiKitSrc}/PixelGhost.tsx`;
    const ctx = makeCtx();
    const g = new PropNamingVocabularyGate({
      discoverFiles: async () => [file],
      readSource: vi.fn(async () => {
        throw new Error('EACCES');
      }),
    });
    const r = await g.run(ctx);
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
  });

  it('respects a custom vocabulary injected via options', async () => {
    const file = `${uiKitSrc}/PixelX.tsx`;
    const ctx = makeCtx();
    const g = new PropNamingVocabularyGate({
      discoverFiles: async () => [file],
      readSource: async () => `export interface PixelXProps { hue?: string; }\n`,
      vocabulary: [
        { canonical: 'tone', intent: 'visual mood', aliases: ['hue'] },
      ],
    });
    const r = await g.run(ctx);
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]!.message).toContain('hue');
    expect(r.findings[0]!.message).toContain('tone');
  });

  it('reports each violation with the source line number', async () => {
    const file = `${uiKitSrc}/PixelButton.tsx`;
    const src = `// header\n// header line 2\nexport interface PixelButtonProps {\n  color?: 'red';\n}\n`;
    const r = await runGateOn({ [file]: src });
    expect(r.passed).toBe(false);
    const f = r.findings[0]!;
    // The `color?` prop is on line 4.
    expect(f.message).toContain(`${file}:4`);
  });
});

// ---------------------------------------------------------------------------
// discoverSourceFiles — only check that it is well-typed and async.
// (Filesystem scanning is covered by the gate's other tests via injection.)
// ---------------------------------------------------------------------------

describe('discoverSourceFiles', () => {
  it('returns an array (smoke test against the real cwd)', async () => {
    const ctx = makeCtx();
    // Point at a non-existent repo so fast-glob returns [] deterministically.
    const noRepoCtx: AuditContext = { ...ctx, repoRoot: '/no/such/path' };
    const files = await discoverSourceFiles(noRepoCtx);
    expect(Array.isArray(files)).toBe(true);
  });
});
