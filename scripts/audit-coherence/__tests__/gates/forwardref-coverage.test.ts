/**
 * Tests for 26-forwardref-coverage.ts
 *
 * Strategy:
 *  - Build a synthetic AuditContext rooted in a tmpdir.
 *  - Inject the file discovery hook to feed in-memory SourceFiles so we never
 *    touch the real monorepo.
 *  - Cover BOTH the heuristic detectors (real regex-driven path) AND the
 *    gate-level composition with injected detectors.
 *
 * Contract checked:
 *  - id/name/description match what callers depend on.
 *  - Vacuous pass when no .tsx files are discovered.
 *  - Component without leaf interactive → ignored entirely (pass).
 *  - Component WITH leaf interactive AND forwardRef → pass.
 *  - Component WITH leaf interactive but NO forwardRef → BLOCKER finding,
 *    with file + component + actionable suggestion that includes a code shape.
 *  - role="button" / role="tab" trigger the gate just like <button> / <a>.
 *  - Compound parent (e.g. Menu with sibling MenuTrigger that itself forwardRefs)
 *    is exempt even without its own forwardRef.
 *  - Detector exceptions surface as blocker findings (no crash).
 *  - duration_ms is a non-negative number.
 *  - The known-violation fixture is the canonical demo and triggers detection.
 */

import * as os from 'node:os';
import * as path from 'node:path';

import * as fs from 'fs-extra';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ForwardRefCoverageGate,
  analyzeComponentDefault,
  detectComponentsDefault,
  extractComponentBody,
  hasCompoundSibling,
  stripComments,
  type ComponentAnalysis,
  type DetectedComponent,
  type SourceFile,
} from '../../gates/26-forwardref-coverage.js';
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
  tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'forwardref-coverage-test-'));
});

afterEach(async () => {
  await fs.remove(tmpRoot).catch(() => undefined);
});

// ---------------------------------------------------------------------------
// stripComments
// ---------------------------------------------------------------------------

describe('stripComments', () => {
  it('removes line and block comments but preserves line count', () => {
    const src = [
      '// import { ghost } from "./ghost";',
      '/* import { phantom } from "./phantom"; */',
      'const Real = () => <button />;',
    ].join('\n');
    const out = stripComments(src);
    expect(out).not.toMatch(/ghost/);
    expect(out).not.toMatch(/phantom/);
    expect(out).toMatch(/<button/);
    expect(out.split('\n')).toHaveLength(3);
  });

  it('does not strip comment-like strings inside string literals', () => {
    const src = 'const s = "// not a comment";';
    const out = stripComments(src);
    expect(out).toMatch(/\/\/ not a comment/);
  });
});

// ---------------------------------------------------------------------------
// extractComponentBody
// ---------------------------------------------------------------------------

describe('extractComponentBody', () => {
  it('returns the body up to the balanced closing brace', () => {
    const src = 'const Foo = () => { return <div />; }; const Bar = 1;';
    const start = src.indexOf('Foo');
    const body = extractComponentBody(src, start);
    expect(body).toMatch(/return <div \/>/);
    // Should not have leaked into the next statement.
    expect(body).not.toMatch(/Bar = 1/);
  });

  it('falls back to ;-terminated body when no brace present', () => {
    const src = 'const Foo = (props) => <div {...props} />;';
    const start = src.indexOf('Foo');
    const body = extractComponentBody(src, start);
    expect(body).toMatch(/<div/);
  });
});

// ---------------------------------------------------------------------------
// detectComponentsDefault
// ---------------------------------------------------------------------------

describe('detectComponentsDefault', () => {
  it('finds export const + function declarations', () => {
    const file: SourceFile = {
      file: '/x.tsx',
      content: [
        'export const Foo = () => <div />;',
        'export function Bar() { return <span />; }',
        'const Baz = forwardRef((p, ref) => <button ref={ref} {...p} />);',
      ].join('\n'),
    };
    const names = detectComponentsDefault(file)
      .map((c) => c.name)
      .sort();
    expect(names).toEqual(['Bar', 'Baz', 'Foo']);
  });

  it('skips non-component PascalCase identifiers (Props, Config, ...)', () => {
    const file: SourceFile = {
      file: '/x.tsx',
      content: [
        'export type FooProps = { x: number };',
        'const FooConfig = { y: 1 };',
        'const FooContext = createContext(null);',
        'export const Real = () => <div />;',
      ].join('\n'),
    };
    const names = detectComponentsDefault(file).map((c) => c.name);
    expect(names).toContain('Real');
    expect(names).not.toContain('FooProps');
    expect(names).not.toContain('FooConfig');
    expect(names).not.toContain('FooContext');
  });
});

// ---------------------------------------------------------------------------
// analyzeComponentDefault
// ---------------------------------------------------------------------------

describe('analyzeComponentDefault', () => {
  it('flags a <button> renderer without forwardRef', () => {
    const file: SourceFile = {
      file: '/Bad.tsx',
      content: 'export const BadButton = (props) => <button {...props} />;',
    };
    const [component] = detectComponentsDefault(file);
    const analysis = analyzeComponentDefault(file, component);
    expect(analysis.rendersLeafInteractive).toBe(true);
    expect(analysis.leafInteractiveKinds).toContain('<button>');
    expect(analysis.usesForwardRef).toBe(false);
    expect(analysis.isCompoundParent).toBe(false);
  });

  it('passes when forwardRef is used', () => {
    const file: SourceFile = {
      file: '/Good.tsx',
      content: [
        'import { forwardRef } from "react";',
        'export const GoodButton = forwardRef<HTMLButtonElement, Props>(',
        '  function GoodButton(props, ref) { return <button ref={ref} {...props} />; },',
        ');',
      ].join('\n'),
    };
    const [component] = detectComponentsDefault(file);
    const analysis = analyzeComponentDefault(file, component);
    expect(analysis.rendersLeafInteractive).toBe(true);
    expect(analysis.usesForwardRef).toBe(true);
  });

  it('detects role="button" / role="tab" as a leaf interactive', () => {
    const file: SourceFile = {
      file: '/Roley.tsx',
      content:
        'export const Roley = (props) => <div role="button" {...props} />;',
    };
    const [component] = detectComponentsDefault(file);
    const analysis = analyzeComponentDefault(file, component);
    expect(analysis.rendersLeafInteractive).toBe(true);
    expect(analysis.leafInteractiveKinds).toContain('role="button"');
    expect(analysis.usesForwardRef).toBe(false);
  });

  it('does NOT flag a layout-only container (no interactive elements)', () => {
    const file: SourceFile = {
      file: '/Layout.tsx',
      content: 'export const Layout = ({ children }) => <div>{children}</div>;',
    };
    const [component] = detectComponentsDefault(file);
    const analysis = analyzeComponentDefault(file, component);
    expect(analysis.rendersLeafInteractive).toBe(false);
  });

  it('detects forwardRef regardless of generic type-args / React. prefix', () => {
    const file: SourceFile = {
      file: '/Generic.tsx',
      content: [
        'export const G = React.forwardRef<HTMLAnchorElement, GProps>(',
        '  function G(p, ref) { return <a ref={ref} {...p} />; },',
        ');',
      ].join('\n'),
    };
    const [component] = detectComponentsDefault(file);
    const analysis = analyzeComponentDefault(file, component);
    expect(analysis.usesForwardRef).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// hasCompoundSibling
// ---------------------------------------------------------------------------

describe('hasCompoundSibling', () => {
  it('returns true when sibling Trigger / Content exists in the same file', () => {
    const src = [
      'export const Menu = ({ children }) => <div>{children}</div>;',
      'export const MenuTrigger = forwardRef<HTMLButtonElement>(',
      '  function MenuTrigger(p, ref) { return <button ref={ref} {...p} />; },',
      ');',
    ].join('\n');
    expect(hasCompoundSibling(src, 'Menu')).toBe(true);
  });

  it('returns true for dot-attached sub-components (Menu.Trigger = ...)', () => {
    const src = [
      'export const Menu = ({ children }) => <div>{children}</div>;',
      'Menu.Trigger = forwardRef(function MenuTrigger(p, ref) { return <button ref={ref} {...p} />; });',
    ].join('\n');
    expect(hasCompoundSibling(src, 'Menu')).toBe(true);
  });

  it('returns false when no sibling pattern is present', () => {
    const src = 'export const Solo = () => <button />;';
    expect(hasCompoundSibling(src, 'Solo')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Gate identity
// ---------------------------------------------------------------------------

describe('ForwardRefCoverageGate identity', () => {
  it('identifies itself with id=26 and the canonical name', () => {
    const gate = new ForwardRefCoverageGate();
    expect(gate.id).toBe(26);
    expect(gate.name).toBe('forwardref-coverage');
    expect(gate.description.length).toBeGreaterThan(20);
  });
});

// ---------------------------------------------------------------------------
// Gate behaviour
// ---------------------------------------------------------------------------

describe('ForwardRefCoverageGate.run', () => {
  it('passes vacuously when no .tsx files are discovered', async () => {
    const ctx = await makeCtx(tmpRoot);
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => [],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
    expect(result.name).toBe('forwardref-coverage');
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('CANONICAL VIOLATION FIXTURE: <button> renderer without forwardRef → blocker', async () => {
    // This is the "known violation" demo the brief asks for.
    const ctx = await makeCtx(tmpRoot);
    const violator: SourceFile = {
      file: path.join(tmpRoot, 'packages/ui-kit/src/PixelBadButton.tsx'),
      content: [
        'import * as React from "react";',
        'export type PixelBadButtonProps = React.ComponentPropsWithoutRef<"button">;',
        '// BUG: This component renders a <button> but never forwards its ref.',
        'export const PixelBadButton = (props: PixelBadButtonProps) => {',
        '  return <button {...props} />;',
        '};',
      ].join('\n'),
    };
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => [violator],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    const f = result.findings[0];
    expect(f.severity).toBe('blocker');
    expect(f.component).toBe('PixelBadButton');
    expect(f.file).toContain('PixelBadButton.tsx');
    expect(f.message).toMatch(/leaf interactive/);
    expect(f.message).toMatch(/<button>/);
    expect(f.message).toMatch(/forwardRef/);
    // Actionable suggestion includes exact replacement code.
    expect(f.suggestion).toBeTruthy();
    expect(f.suggestion).toMatch(/forwardRef</);
    expect(f.suggestion).toMatch(/PixelBadButton/);
    expect(f.suggestion).toMatch(/displayName/);
    expect(f.suggestion).toMatch(/ComponentPropsWithoutRef/);
  });

  it('passes when forwardRef IS present', async () => {
    const ctx = await makeCtx(tmpRoot);
    const compliant: SourceFile = {
      file: path.join(tmpRoot, 'packages/ui-kit/src/PixelGoodButton.tsx'),
      content: [
        'import { forwardRef } from "react";',
        'export const PixelGoodButton = forwardRef<HTMLButtonElement>(',
        '  function PixelGoodButton(props, ref) {',
        '    return <button ref={ref} {...props} />;',
        '  },',
        ');',
        'PixelGoodButton.displayName = "PixelGoodButton";',
      ].join('\n'),
    };
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => [compliant],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('passes for components without any leaf-interactive element', async () => {
    const ctx = await makeCtx(tmpRoot);
    const layoutOnly: SourceFile = {
      file: path.join(tmpRoot, 'packages/ui-kit/src/Stack.tsx'),
      content: [
        'export const Stack = ({ children }: { children: React.ReactNode }) => (',
        '  <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>',
        ');',
      ].join('\n'),
    };
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => [layoutOnly],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('passes for compound parent (Menu) when MenuTrigger sibling exists', async () => {
    const ctx = await makeCtx(tmpRoot);
    const compound: SourceFile = {
      file: path.join(tmpRoot, 'packages/ui-kit/src/Menu.tsx'),
      content: [
        'import { forwardRef } from "react";',
        // Parent: no own forwardRef, no own leaf interactive — pure container.
        'export const Menu = ({ children }: { children: React.ReactNode }) => (',
        '  <div className="menu">{children}</div>',
        ');',
        // Sub-component: leaf interactive AND uses forwardRef.',
        'export const MenuTrigger = forwardRef<HTMLButtonElement>(',
        '  function MenuTrigger(props, ref) {',
        '    return <button ref={ref} {...props} />;',
        '  },',
        ');',
      ].join('\n'),
    };
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => [compound],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });

  it('flags role="button" leaf interactive without forwardRef', async () => {
    const ctx = await makeCtx(tmpRoot);
    const violator: SourceFile = {
      file: path.join(tmpRoot, 'packages/ui-kit/src/RoleyButton.tsx'),
      content: [
        'export const RoleyButton = (props) => (',
        '  <div role="button" tabIndex={0} {...props} />',
        ');',
      ].join('\n'),
    };
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => [violator],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].message).toMatch(/role="button"/);
    expect(result.findings[0].suggestion).toMatch(/forwardRef</);
  });

  it('flags role="tab" leaf interactive without forwardRef', async () => {
    const ctx = await makeCtx(tmpRoot);
    const violator: SourceFile = {
      file: path.join(tmpRoot, 'packages/ui-kit/src/RoleyTab.tsx'),
      content:
        'export const RoleyTab = (props) => <div role="tab" {...props} />;',
    };
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => [violator],
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings[0].message).toMatch(/role="tab"/);
  });

  it('flags <a> and <input> leaf interactives without forwardRef', async () => {
    const ctx = await makeCtx(tmpRoot);
    const files: SourceFile[] = [
      {
        file: path.join(tmpRoot, 'packages/ui-kit/src/BadLink.tsx'),
        content: 'export const BadLink = (p) => <a href="#" {...p} />;',
      },
      {
        file: path.join(tmpRoot, 'packages/ui-kit/src/BadInput.tsx'),
        content: 'export const BadInput = (p) => <input type="text" {...p} />;',
      },
    ];
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => files,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(2);
    const byComponent = new Map(
      result.findings.map((f) => [f.component, f] as const),
    );
    expect(byComponent.get('BadLink')?.message).toMatch(/<a>/);
    expect(byComponent.get('BadInput')?.message).toMatch(/<input>/);
  });

  it('surfaces detector exceptions as blocker findings (no crash)', async () => {
    const ctx = await makeCtx(tmpRoot);
    const file = path.join(tmpRoot, 'packages/ui-kit/src/Boom.tsx');
    const files: SourceFile[] = [
      { file, content: 'export const Boom = () => <button />;' },
    ];
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => files,
      detectComponents: () => {
        throw new Error('detector exploded');
      },
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('blocker');
    expect(result.findings[0].message).toMatch(/detector threw/);
    expect(result.findings[0].message).toMatch(/detector exploded/);
  });

  it('surfaces analyzer exceptions as blocker findings (no crash)', async () => {
    const ctx = await makeCtx(tmpRoot);
    const file = path.join(tmpRoot, 'packages/ui-kit/src/Boom.tsx');
    const files: SourceFile[] = [
      { file, content: 'export const Boom = () => <button />;' },
    ];
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => files,
      analyzeComponent: () => {
        throw new Error('analyzer exploded');
      },
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe('blocker');
    expect(result.findings[0].message).toMatch(/analyzer threw/);
    expect(result.findings[0].message).toMatch(/analyzer exploded/);
    expect(result.findings[0].component).toBe('Boom');
  });

  it('aggregates findings across multiple files', async () => {
    const ctx = await makeCtx(tmpRoot);
    const files: SourceFile[] = [
      {
        file: path.join(tmpRoot, 'packages/ui-kit/src/A.tsx'),
        content: 'export const A = (p) => <button {...p} />;',
      },
      {
        file: path.join(tmpRoot, 'packages/ui-kit/src/B.tsx'),
        content: 'export const B = (p) => <a {...p} />;',
      },
      {
        file: path.join(tmpRoot, 'packages/ui-kit/src/Clean.tsx'),
        content: 'export const Clean = ({ children }) => <div>{children}</div>;',
      },
    ];
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => files,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings).toHaveLength(2);
    const components = new Set(result.findings.map((f) => f.component));
    expect(components.has('A')).toBe(true);
    expect(components.has('B')).toBe(true);
    expect(components.has('Clean')).toBe(false);
  });

  it('default discovery ignores Component.examples.tsx demo files (header-documented exemption)', async () => {
    // Repo convention: doc demo snippets live in `<Component>.examples.tsx`
    // next to the implementation (NOT only under an examples/ directory).
    // Those exports (Default, Sizes, AsChild, ...) are usage demos, not kit
    // components — the gate header explicitly excludes examples.
    const srcDir = path.join(tmpRoot, 'packages/ui-kit/src/forms');
    await fs.ensureDir(srcDir);
    await fs.writeFile(
      path.join(srcDir, 'PixelThing.examples.tsx'),
      [
        '// demo snippet — exported example render, not a component implementation',
        'export function Sizes() {',
        '  return <button onClick={() => {}}>demo</button>;',
        '}',
      ].join('\n'),
      'utf8',
    );
    // A REAL violator in the same tree must still be flagged.
    await fs.writeFile(
      path.join(srcDir, 'PixelThing.tsx'),
      'export const PixelThing = (p) => <button {...p} />;',
      'utf8',
    );
    const ctx = await makeCtx(tmpRoot);
    const gate = new ForwardRefCoverageGate(); // real default discovery
    const result = await gate.run(ctx);
    expect(result.passed).toBe(false);
    expect(result.findings.map((f) => f.component)).toEqual(['PixelThing']);
    expect(
      result.findings.every((f) => !(f.file ?? '').includes('.examples.')),
    ).toBe(true);
  });

  it('returns a non-negative duration_ms', async () => {
    const ctx = await makeCtx(tmpRoot);
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => [],
    });
    const result = await gate.run(ctx);
    expect(result.duration_ms).toBeGreaterThanOrEqual(0);
    expect(typeof result.duration_ms).toBe('number');
  });

  it('lets a custom analyzer override default behaviour (passes when forced)', async () => {
    const ctx = await makeCtx(tmpRoot);
    const file = path.join(tmpRoot, 'packages/ui-kit/src/Forced.tsx');
    const files: SourceFile[] = [
      { file, content: 'export const Forced = (p) => <button {...p} />;' },
    ];
    const forced: ComponentAnalysis = {
      component: { name: 'Forced', line: 1, body: '' },
      rendersLeafInteractive: false,
      leafInteractiveKinds: [],
      usesForwardRef: false,
      isCompoundParent: false,
    };
    const gate = new ForwardRefCoverageGate({
      discoverFiles: async () => files,
      detectComponents: (): DetectedComponent[] => [
        { name: 'Forced', line: 1, body: '' },
      ],
      analyzeComponent: () => forced,
    });
    const result = await gate.run(ctx);
    expect(result.passed).toBe(true);
    expect(result.findings).toEqual([]);
  });
});
