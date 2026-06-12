/**
 * Tests for 23-prop-inheritance-base.ts
 *
 * Strategy: build synthetic AuditContexts rooted in a tmpdir, then inject
 * ScannedSource[] fixtures and run the gate. We exercise BOTH invariants:
 *
 *  - Rest-spread safety (Check 1): a component that spreads `...rest` into
 *    JSX but whose Props interface does NOT extend HTMLAttributes must
 *    produce a MAJOR finding with an actionable suggestion.
 *  - Layout-primitive base coherence (Check 2): all seven layout primitives
 *    must share the same `extends React.HTMLAttributes<HTMLDivElement>` base
 *    AND declare an `as?` prop. Any divergence is MAJOR.
 *
 * We also unit-test the lower-level helpers (`stripStringsAndComments`,
 * `detectHTMLAttrsInterface`, `analyzeFile`) because they carry the bulk of
 * the parsing risk.
 */

import * as os from 'node:os';
import * as path from 'node:path';

import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  LAYOUT_PRIMITIVES,
  PropInheritanceBaseGate,
  analyzeFile,
  detectHTMLAttrsInterface,
  stripStringsAndComments,
  type ScannedSource,
} from '../../gates/23-prop-inheritance-base.js';
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
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'prop-inherit-test-'));
});

afterEach(async () => {
  await fs.remove(tmpRoot).catch(() => undefined);
});

function srcFile(name: string, content: string): ScannedSource {
  return {
    file: path.join(tmpRoot, 'packages/ui-kit/src', name),
    content,
  };
}

// Canonical "good" layout primitive — matches the real PixelBox shape.
const GOOD_LAYOUT_SOURCE = (compName: string): string => `
'use client';
import React, { forwardRef } from 'react';

export interface ${compName}Props extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof React.JSX.IntrinsicElements;
  surface?: 'pixel' | 'linear';
}

export const ${compName} = forwardRef<HTMLDivElement, ${compName}Props>(function ${compName}(
  {
    as,
    surface,
    className,
    children,
    ...rest
  },
  ref,
) {
  const Comp = (as ?? 'div') as 'div';
  return (
    <Comp ref={ref} className={className} {...rest}>
      {children}
    </Comp>
  );
});
`;

// "Bad" component — spreads ...rest into JSX but Props doesn't extend HTMLAttributes.
const BAD_RESTSPREAD_SOURCE = `
'use client';
import React, { forwardRef } from 'react';

export interface PixelBadProps {
  tone?: 'neutral' | 'accent';
  surface?: 'pixel' | 'linear';
}

export const PixelBad = forwardRef<HTMLDivElement, PixelBadProps>(function PixelBad(
  {
    tone,
    surface,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
});
`;

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

describe('stripStringsAndComments', () => {
  it('preserves offsets while erasing comments and strings', () => {
    const src = `const x = "interface FakeProps extends X {"; // interface FakeProps
/* interface AnotherFakeProps extends Y { */
interface RealProps extends React.HTMLAttributes<HTMLDivElement> {}`;
    const out = stripStringsAndComments(src);
    expect(out.length).toBe(src.length);
    expect(out).not.toContain('FakeProps');
    expect(out).not.toContain('AnotherFakeProps');
    expect(out).toContain('RealProps');
    expect(out).toContain('HTMLAttributes');
  });

  it('handles unterminated strings without throwing', () => {
    const src = `const x = "unterminated`;
    expect(() => stripStringsAndComments(src)).not.toThrow();
  });
});

describe('detectHTMLAttrsInterface', () => {
  it('detects bare HTMLAttributes<...>', () => {
    expect(detectHTMLAttrsInterface('React.HTMLAttributes<HTMLDivElement>')).toBe(
      'HTMLAttributes',
    );
  });

  it('detects typed variants', () => {
    expect(
      detectHTMLAttrsInterface('React.ButtonHTMLAttributes<HTMLButtonElement>'),
    ).toBe('ButtonHTMLAttributes');
    expect(
      detectHTMLAttrsInterface('InputHTMLAttributes<HTMLInputElement>'),
    ).toBe('InputHTMLAttributes');
  });

  it('detects Omit<React.HTMLAttributes<...>, ...> wrappers', () => {
    expect(
      detectHTMLAttrsInterface("Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>"),
    ).toBe('HTMLAttributes');
  });

  it('returns null when no HTMLAttributes interface is present', () => {
    expect(detectHTMLAttrsInterface('SomeUnrelatedProps')).toBeNull();
    expect(detectHTMLAttrsInterface('')).toBeNull();
  });

  it('detects React.SVGAttributes<...> as a rest-spread-safe base (svg-rooted components)', () => {
    expect(detectHTMLAttrsInterface('React.SVGAttributes<SVGSVGElement>')).toBe(
      'SVGAttributes',
    );
    expect(detectHTMLAttrsInterface('SVGAttributes<SVGSVGElement>')).toBe(
      'SVGAttributes',
    );
  });

  it('detects SVGProps, including Omit-wrapped', () => {
    expect(
      detectHTMLAttrsInterface("Omit<React.SVGProps<SVGSVGElement>, 'width'>"),
    ).toBe('SVGProps');
  });
});

describe('analyzeFile', () => {
  it('extracts interface props, extends, declaresAs', () => {
    const a = analyzeFile(srcFile('PixelStack.tsx', GOOD_LAYOUT_SOURCE('PixelStack')));
    expect(a.props).toHaveLength(1);
    const p = a.props[0];
    expect(p.name).toBe('PixelStackProps');
    expect(p.extendsHTMLAttributes).toBe(true);
    expect(p.htmlAttrsInterface).toBe('HTMLAttributes');
    expect(p.declaresAs).toBe(true);
    expect(a.components).toHaveLength(1);
    const c = a.components[0];
    expect(c.componentName).toBe('PixelStack');
    expect(c.spreadsRest).toBe(true);
    expect(c.restIdentifier).toBe('rest');
    expect(c.forwardsRestToJSX).toBe(true);
  });

  it('detects when Props does NOT extend HTMLAttributes', () => {
    const a = analyzeFile(srcFile('PixelBad.tsx', BAD_RESTSPREAD_SOURCE));
    expect(a.props).toHaveLength(1);
    expect(a.props[0].extendsHTMLAttributes).toBe(false);
    expect(a.props[0].htmlAttrsInterface).toBeNull();
  });

  it('ignores commented-out interface declarations', () => {
    const src = `
// export interface FakeProps extends X { as?: string }
/* export interface AlsoFakeProps extends Y {} */
export interface RealProps extends React.HTMLAttributes<HTMLDivElement> {}
`;
    const a = analyzeFile(srcFile('PixelX.tsx', src));
    expect(a.props.map((p) => p.name)).toEqual(['RealProps']);
  });
});

// ---------------------------------------------------------------------------
// Gate identity + vacuous pass
// ---------------------------------------------------------------------------

describe('PropInheritanceBaseGate identity', () => {
  it('identifies itself with id=23 and the canonical name', () => {
    const gate = new PropInheritanceBaseGate();
    expect(gate.id).toBe(23);
    expect(gate.name).toBe('prop-inheritance-base');
    expect(gate.description.length).toBeGreaterThan(20);
  });

  it('passes vacuously when no files are discovered', async () => {
    const ctx = await makeCtx(tmpRoot);
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => [],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('exports LAYOUT_PRIMITIVES with exactly the seven canonical names', () => {
    expect([...LAYOUT_PRIMITIVES].sort()).toEqual(
      [
        'PixelBox',
        'PixelCenter',
        'PixelCluster',
        'PixelContainer',
        'PixelGrid',
        'PixelStack',
        'PixelTwoColumn',
      ].sort(),
    );
  });
});

// ---------------------------------------------------------------------------
// Check 1: rest-spread safety
// ---------------------------------------------------------------------------

describe('Check 1 — rest-spread safety', () => {
  it('FAILS with a MAJOR finding when a component forwards ...rest but Props does not extend HTMLAttributes', async () => {
    const ctx = await makeCtx(tmpRoot);
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => [srcFile('PixelBad.tsx', BAD_RESTSPREAD_SOURCE)],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    const major = result.findings.filter((f) => f.severity === 'major');
    expect(major.length).toBeGreaterThanOrEqual(1);
    const restFinding = major.find((f) => /does not extend/.test(f.message));
    expect(restFinding).toBeDefined();
    expect(restFinding?.component).toBe('PixelBad');
    expect(restFinding?.file).toContain('PixelBad.tsx');
    expect(restFinding?.suggestion).toBeTruthy();
    expect(restFinding?.suggestion).toMatch(/extends React\.HTMLAttributes/);
    expect(restFinding?.suggestion).toMatch(/PixelBadProps/);
  });

  it('PASSES when a component forwards ...rest and Props extends HTMLAttributes', async () => {
    const ctx = await makeCtx(tmpRoot);
    const gate = new PropInheritanceBaseGate({
      // Use a non-layout-primitive name so Check 2 doesn't kick in.
      discoverFiles: async () => [
        srcFile('PixelButton.tsx', GOOD_LAYOUT_SOURCE('PixelButton')),
      ],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('accepts Omit<React.HTMLAttributes<...>, ...> as a valid extension', async () => {
    const ctx = await makeCtx(tmpRoot);
    const src = `
import React, { forwardRef } from 'react';
export interface PixelOmitProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  tone?: string;
}
export const PixelOmit = forwardRef<HTMLDivElement, PixelOmitProps>(function PixelOmit(
  { tone, className, children, ...rest },
  ref,
) {
  return <div ref={ref} className={className} {...rest}>{children}</div>;
});
`;
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => [srcFile('PixelOmit.tsx', src)],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
  });

  it('accepts ButtonHTMLAttributes as a valid extension', async () => {
    const ctx = await makeCtx(tmpRoot);
    const src = `
import React, { forwardRef } from 'react';
export interface PixelBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: string;
}
export const PixelBtn = forwardRef<HTMLButtonElement, PixelBtnProps>(function PixelBtn(
  { tone, className, children, ...rest },
  ref,
) {
  return <button ref={ref} className={className} {...rest}>{children}</button>;
});
`;
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => [srcFile('PixelBtn.tsx', src)],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Check 1 extensions: SVG roots, transitive inheritance, *Root pairing
// ---------------------------------------------------------------------------

describe('Check 1 — SVG-rooted components', () => {
  it('PASSES when an <svg>-rooted component extends React.SVGAttributes (HTMLAttributes would be the WRONG base)', async () => {
    const ctx = await makeCtx(tmpRoot);
    const src = `
'use client';
import React, { forwardRef } from 'react';
export interface PixelChartProps extends React.SVGAttributes<SVGSVGElement> {
  data: number[];
  tone?: string;
}
export const PixelChart = forwardRef<SVGSVGElement, PixelChartProps>(function PixelChart(
  { data, tone, className, ...rest },
  ref,
) {
  return <svg ref={ref} role="img" className={className} {...rest} />;
});
`;
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => [srcFile('PixelChart.tsx', src)],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });
});

describe('Check 1 — transitive Props inheritance', () => {
  it('PASSES when Props extends another Props interface (in the scan set) that itself extends HTMLAttributes', async () => {
    const ctx = await makeCtx(tmpRoot);
    const base = `
import React, { forwardRef } from 'react';
export interface PixelBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number;
  align?: 'start' | 'end';
}
export const PixelBase = forwardRef<HTMLDivElement, PixelBaseProps>(function PixelBase(
  { gap, align, className, children, ...rest },
  ref,
) {
  return <div ref={ref} className={className} {...rest}>{children}</div>;
});
`;
    const derived = `
import React, { forwardRef } from 'react';
import { PixelBase, PixelBaseProps } from './PixelBase';
export interface PixelDerivedProps extends Omit<PixelBaseProps, 'align'> {
  rowAlign?: 'top' | 'stretch';
}
export const PixelDerived = forwardRef<HTMLDivElement, PixelDerivedProps>(function PixelDerived(
  { rowAlign, className, children, ...rest },
  ref,
) {
  return (
    <PixelBase ref={ref} align="start" className={className} {...rest}>
      {children}
    </PixelBase>
  );
});
`;
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => [
        srcFile('PixelBase.tsx', base),
        srcFile('PixelDerived.tsx', derived),
      ],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('still FAILS when the extends chain never reaches an HTMLAttributes-family base', async () => {
    const ctx = await makeCtx(tmpRoot);
    const orphan = `
import React, { forwardRef } from 'react';
interface PixelLooseProps {
  tone?: string;
}
export interface PixelOrphanProps extends Omit<PixelLooseProps, 'tone'> {
  surface?: string;
}
export const PixelOrphan = forwardRef<HTMLDivElement, PixelOrphanProps>(function PixelOrphan(
  { surface, className, children, ...rest },
  ref,
) {
  return <div ref={ref} className={className} {...rest}>{children}</div>;
});
`;
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => [srcFile('PixelOrphan.tsx', orphan)],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    const major = result.findings.find(
      (f) => f.severity === 'major' && f.component === 'PixelOrphan',
    );
    expect(major).toBeDefined();
  });
});

describe('Check 1 — *Root component pairing', () => {
  it('pairs PixelFooRoot with PixelFooProps (compositional Root convention) instead of emitting an info finding', async () => {
    const ctx = await makeCtx(tmpRoot);
    // Two Props interfaces in the file so the single-interface fallback can't
    // mask the pairing logic.
    const src = `
'use client';
import React, { forwardRef } from 'react';
export interface PixelFooProps extends React.HTMLAttributes<HTMLDivElement> {
  loop?: boolean;
}
interface PixelFooItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number;
}
const PixelFooItem = forwardRef<HTMLDivElement, PixelFooItemProps>(function PixelFooItem(
  { index, className, children, ...rest },
  ref,
) {
  return <div ref={ref} className={className} {...rest}>{children}</div>;
});
const PixelFooRoot = forwardRef<HTMLDivElement, PixelFooProps>(function PixelFoo(
  { loop, className, children, ...rest },
  ref,
) {
  return <div ref={ref} className={className} {...rest}>{children}</div>;
});
export const PixelFoo = Object.assign(PixelFooRoot, { Item: PixelFooItem });
`;
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => [srcFile('PixelFoo.tsx', src)],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Check 2: layout-primitive base coherence
// ---------------------------------------------------------------------------

describe('Check 2 — layout-primitive base coherence', () => {
  it('PASSES when all seven layout primitives share the canonical base', async () => {
    const ctx = await makeCtx(tmpRoot);
    const files = LAYOUT_PRIMITIVES.map((name) =>
      srcFile(`layout/${name}.tsx`, GOOD_LAYOUT_SOURCE(name)),
    );
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => files,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('FAILS with MAJOR when one primitive is missing the `as?` prop', async () => {
    const ctx = await makeCtx(tmpRoot);
    const missingAs = `
import React, { forwardRef } from 'react';
export interface PixelStackProps extends React.HTMLAttributes<HTMLDivElement> {
  surface?: 'pixel' | 'linear';
}
export const PixelStack = forwardRef<HTMLDivElement, PixelStackProps>(function PixelStack(
  { surface, className, children, ...rest },
  ref,
) {
  return <div ref={ref} className={className} {...rest}>{children}</div>;
});
`;
    const files: ScannedSource[] = LAYOUT_PRIMITIVES.map((name) =>
      name === 'PixelStack'
        ? srcFile(`layout/PixelStack.tsx`, missingAs)
        : srcFile(`layout/${name}.tsx`, GOOD_LAYOUT_SOURCE(name)),
    );
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => files,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    const major = result.findings.filter((f) => f.severity === 'major');
    const asFinding = major.find(
      (f) => /missing the required `as\?` polymorphic prop/.test(f.message) ?? false,
    );
    expect(asFinding).toBeDefined();
    expect(asFinding?.component).toBe('PixelStack');
    expect(asFinding?.suggestion).toMatch(/as\?: keyof React\.JSX\.IntrinsicElements/);
  });

  it('FAILS with MAJOR when one primitive does not extend HTMLAttributes at all', async () => {
    const ctx = await makeCtx(tmpRoot);
    const noExtends = `
import React, { forwardRef } from 'react';
export interface PixelGridProps {
  as?: keyof React.JSX.IntrinsicElements;
  cols?: number;
}
export const PixelGrid = forwardRef<HTMLDivElement, PixelGridProps>(function PixelGrid(
  { as, cols, className, children, ...rest },
  ref,
) {
  const Comp = (as ?? 'div') as 'div';
  return <Comp ref={ref} className={className} {...rest}>{children}</Comp>;
});
`;
    const files: ScannedSource[] = LAYOUT_PRIMITIVES.map((name) =>
      name === 'PixelGrid'
        ? srcFile(`layout/PixelGrid.tsx`, noExtends)
        : srcFile(`layout/${name}.tsx`, GOOD_LAYOUT_SOURCE(name)),
    );
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => files,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    // Should produce BOTH a Check-1 finding (forwards rest w/o HTMLAttributes)
    // AND a Check-2 finding (primitive missing canonical base).
    const messages = result.findings.map((f) => f.message).join('\n');
    expect(messages).toMatch(/PixelGrid/);
    expect(messages).toMatch(/HTMLAttributes/);
  });

  it('FAILS with MAJOR when primitives DIVERGE on HTMLAttributes interface', async () => {
    const ctx = await makeCtx(tmpRoot);
    // Make PixelTwoColumn extend ButtonHTMLAttributes (wrong on purpose) while
    // the other six extend HTMLAttributes (canonical).
    const diverged = `
import React, { forwardRef } from 'react';
export interface PixelTwoColumnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: keyof React.JSX.IntrinsicElements;
}
export const PixelTwoColumn = forwardRef<HTMLButtonElement, PixelTwoColumnProps>(function PixelTwoColumn(
  { as, className, children, ...rest },
  ref,
) {
  return <button ref={ref} className={className} {...rest}>{children}</button>;
});
`;
    const files: ScannedSource[] = LAYOUT_PRIMITIVES.map((name) =>
      name === 'PixelTwoColumn'
        ? srcFile('layout/PixelTwoColumn.tsx', diverged)
        : srcFile(`layout/${name}.tsx`, GOOD_LAYOUT_SOURCE(name)),
    );
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => files,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    const diverge = result.findings.find((f) =>
      /diverge on which HTMLAttributes interface/.test(f.message),
    );
    expect(diverge).toBeDefined();
    expect(diverge?.severity).toBe('major');
    expect(diverge?.suggestion).toMatch(/HTMLDivElement/);
  });

  it('does NOT fire layout-primitive checks when no primitives are in the scan set', async () => {
    const ctx = await makeCtx(tmpRoot);
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => [
        srcFile('PixelButton.tsx', GOOD_LAYOUT_SOURCE('PixelButton')),
      ],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Robustness
// ---------------------------------------------------------------------------

describe('Robustness', () => {
  it('returns a non-negative duration_ms even when no files are scanned', async () => {
    const ctx = await makeCtx(tmpRoot);
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => [],
    });
    const result = await gate.run(ctx);
    expect(typeof result.duration_ms).toBe('number');
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('reports a MAJOR analyzer-threw finding when analyzeFile throws', async () => {
    const ctx = await makeCtx(tmpRoot);
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => [srcFile('PixelX.tsx', '/* */')],
      analyzeFile: () => {
        throw new Error('boom');
      },
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings[0].severity).toBe('major');
    expect(result.findings[0].message).toMatch(/analyzer threw/);
    expect(result.findings[0].message).toMatch(/boom/);
  });

  it('allows callers to override the layout-primitives list', async () => {
    const ctx = await makeCtx(tmpRoot);
    // We declare a single custom primitive and intentionally give it a bad
    // base (no extends, no `as?`). The gate must flag it because we told it
    // this name is a layout primitive.
    const badCustom = `
import React, { forwardRef } from 'react';
export interface CustomPrimitiveProps {
  tone?: string;
}
export const CustomPrimitive = forwardRef<HTMLDivElement, CustomPrimitiveProps>(function CustomPrimitive(
  { tone, className, children, ...rest },
  ref,
) {
  return <div ref={ref} className={className} {...rest}>{children}</div>;
});
`;
    const gate = new PropInheritanceBaseGate({
      discoverFiles: async () => [srcFile('CustomPrimitive.tsx', badCustom)],
      layoutPrimitives: ['CustomPrimitive'],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    const messages = result.findings.map((f) => f.message).join('\n');
    expect(messages).toMatch(/CustomPrimitive/);
    expect(messages).toMatch(/HTMLAttributes/);
  });
});
