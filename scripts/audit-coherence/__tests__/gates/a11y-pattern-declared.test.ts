/**
 * Unit tests for Gate 28 — a11y-pattern-declared.
 *
 * The AuditContext is fully mocked. File reads + existence probes are
 * stubbed via the gate's option hooks so the suite never touches the real
 * filesystem.
 *
 * Fixture strategy: each block of tests builds the minimum manifest +
 * synthetic impl source needed to trigger one rule, so failures point at a
 * single behaviour.
 */

import * as path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import type { AuditContext, ManifestRecord } from '../../_lib/load-context.js';
import gate, {
  A11yPatternDeclaredGate,
  KNOWN_PATTERNS,
  INTERACTIVE_NAME_HINTS,
  normaliseComponentName,
  inferInteractiveFromName,
  decideInteractivity,
  validatePatternsShape,
  declaredPatternSet,
  harvestRolesFromSource,
  compareDeclaredVsRoles,
  resolveImplFile,
} from '../../gates/28-a11y-pattern-declared.js';

// ---------------------------------------------------------------------------
// Synthetic repo + helpers
// ---------------------------------------------------------------------------

const repoRoot = path.resolve('/virtual/repo');
const uiKitDir = path.join(repoRoot, 'packages', 'ui-kit');
const uiKitSrc = path.join(uiKitDir, 'src');

function mkManifest(fields: Record<string, unknown>): ManifestRecord {
  return {
    component: 'PixelComponent',
    source: path.join(uiKitSrc, 'pixel-component.manifest.ts'),
    ...fields,
  } as unknown as ManifestRecord;
}

function makeCtx(manifests: ManifestRecord[]): AuditContext {
  return {
    repoRoot,
    manifests,
    uiKitSrcDir: uiKitSrc,
    appsWebSrcDir: path.join(repoRoot, 'apps/web/src'),
    tokensFile: path.join(uiKitSrc, 'tokens.ts'),
    registryFile: path.join(uiKitSrc, 'registry.ts'),
    readmeFiles: [],
    changelogFiles: [],
    packageJsons: [
      { package: '@pxlkit/ui-kit', path: path.join(uiKitDir, 'package.json') },
    ],
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
  };
}

/**
 * Build a stub fs pair (readFile + pathExists) backed by an in-memory map of
 * absolute path → file contents. Files not in the map don't exist.
 */
function stubFs(files: Record<string, string>) {
  const readFile = vi.fn(async (absPath: string): Promise<string | null> => {
    return files[absPath] ?? null;
  });
  const pathExists = vi.fn(async (absPath: string): Promise<boolean> => {
    return Object.prototype.hasOwnProperty.call(files, absPath);
  });
  return { readFile, pathExists };
}

// ---------------------------------------------------------------------------
// Pattern vocabulary surface
// ---------------------------------------------------------------------------

describe('KNOWN_PATTERNS / INTERACTIVE_NAME_HINTS', () => {
  it('contains the WAI-ARIA widget patterns the brief named explicitly', () => {
    for (const p of ['button', 'combobox', 'menu', 'tablist', 'grid']) {
      expect(KNOWN_PATTERNS.has(p)).toBe(true);
    }
  });

  it('every name hint corresponds to (or maps to) a known pattern or known role', () => {
    // Sanity: hints are lowercase, non-empty, deduplicated.
    expect(INTERACTIVE_NAME_HINTS.every((h) => h === h.toLowerCase())).toBe(true);
    expect(new Set(INTERACTIVE_NAME_HINTS).size).toBe(INTERACTIVE_NAME_HINTS.length);
  });
});

// ---------------------------------------------------------------------------
// normaliseComponentName / inferInteractiveFromName
// ---------------------------------------------------------------------------

describe('normaliseComponentName', () => {
  it('lowercases and strips non-alphanumerics', () => {
    expect(normaliseComponentName('PixelComboBox')).toBe('pixelcombobox');
    expect(normaliseComponentName('Pixel-Tab_List')).toBe('pixeltablist');
    expect(normaliseComponentName('TooltipV2')).toBe('tooltipv2');
  });
});

describe('inferInteractiveFromName', () => {
  it('detects common widget hints embedded in component names', () => {
    expect(inferInteractiveFromName('PixelButton')).toBe('button');
    expect(inferInteractiveFromName('PixelComboBox')).toBe('combobox');
    expect(inferInteractiveFromName('PixelTablist')).toBe('tablist');
    expect(inferInteractiveFromName('PixelMenu')).toBe('menu');
  });

  it('returns null for non-interactive names', () => {
    expect(inferInteractiveFromName('PixelBox')).toBeNull();
    expect(inferInteractiveFromName('PixelCard')).toBeNull();
    expect(inferInteractiveFromName('PixelHero')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// decideInteractivity
// ---------------------------------------------------------------------------

describe('decideInteractivity', () => {
  it('honours explicit interactive: false (opt-out wins)', () => {
    const d = decideInteractivity({ component: 'PixelButton', interactive: false });
    expect(d.interactive).toBe(false);
    expect(d.reason).toBe('explicit-false');
  });

  it('honours explicit interactive: true', () => {
    const d = decideInteractivity({ component: 'PixelBox', interactive: true });
    expect(d.interactive).toBe(true);
    expect(d.reason).toBe('explicit-true');
  });

  it('falls back to name-hint when no explicit flag', () => {
    const d = decideInteractivity({ component: 'PixelCombobox' });
    expect(d.interactive).toBe(true);
    expect(d.reason).toBe('name-hint');
    expect(d.hint).toBe('combobox');
  });

  it('declines when there is no explicit flag and no name hint', () => {
    const d = decideInteractivity({ component: 'PixelBox' });
    expect(d.interactive).toBe(false);
    expect(d.reason).toBe('no-signal');
  });
});

// ---------------------------------------------------------------------------
// validatePatternsShape
// ---------------------------------------------------------------------------

describe('validatePatternsShape', () => {
  it('passes when a11y.patterns is a non-empty array of known tokens', () => {
    expect(
      validatePatternsShape({ a11y: { patterns: ['button'] } }),
    ).toEqual([]);
    expect(
      validatePatternsShape({ a11y: { patterns: ['combobox', 'listbox'] } }),
    ).toEqual([]);
  });

  it('flags missing a11y block', () => {
    const v = validatePatternsShape({});
    expect(v).toHaveLength(1);
    expect(v[0]!.kind).toBe('missing-a11y-block');
  });

  it('flags missing patterns field', () => {
    const v = validatePatternsShape({ a11y: {} });
    expect(v).toHaveLength(1);
    expect(v[0]!.kind).toBe('missing-patterns');
  });

  it('flags empty array', () => {
    const v = validatePatternsShape({ a11y: { patterns: [] } });
    expect(v).toHaveLength(1);
    expect(v[0]!.kind).toBe('empty-patterns');
  });

  it('flags non-array shapes', () => {
    const v = validatePatternsShape({ a11y: { patterns: 'button' } });
    expect(v).toHaveLength(1);
    expect(v[0]!.kind).toBe('not-array');
  });

  it('flags non-string entries individually', () => {
    const v = validatePatternsShape({ a11y: { patterns: ['button', 42, null] } });
    expect(v).toHaveLength(2);
    expect(v.every((x) => x.kind === 'non-string-entry')).toBe(true);
  });

  it('flags unknown pattern tokens individually (typos)', () => {
    const v = validatePatternsShape({ a11y: { patterns: ['cobobox', 'menuu'] } });
    expect(v).toHaveLength(2);
    expect(v.every((x) => x.kind === 'unknown-pattern')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// declaredPatternSet
// ---------------------------------------------------------------------------

describe('declaredPatternSet', () => {
  it('lowercases + skips malformed entries', () => {
    const s = declaredPatternSet({
      a11y: { patterns: ['Combobox', 'Listbox', 42, ''] },
    });
    expect([...s].sort()).toEqual(['combobox', 'listbox']);
  });

  it('returns empty set when a11y is missing or malformed', () => {
    expect(declaredPatternSet({}).size).toBe(0);
    expect(declaredPatternSet({ a11y: { patterns: 'nope' } }).size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// harvestRolesFromSource
// ---------------------------------------------------------------------------

describe('harvestRolesFromSource', () => {
  it('harvests double-quoted role attributes', () => {
    const src = `<div role="combobox" aria-expanded={open}>`;
    expect([...harvestRolesFromSource(src)]).toEqual(['combobox']);
  });

  it('harvests JSX-expression-wrapped role attributes', () => {
    const src = `<div role={'menu'}> <span role={"menuitem"}/>`;
    expect([...harvestRolesFromSource(src)].sort()).toEqual(['menu', 'menuitem']);
  });

  it('deduplicates multiple occurrences', () => {
    const src = `<button role="button" /> <button role="button" />`;
    expect([...harvestRolesFromSource(src)]).toEqual(['button']);
  });

  it('ignores dynamic roles (role={var})', () => {
    const src = `<div role={kind}>`;
    expect(harvestRolesFromSource(src).size).toBe(0);
  });

  it('returns empty for source with no role attribute', () => {
    expect(harvestRolesFromSource(`<div className="x" />`).size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// compareDeclaredVsRoles
// ---------------------------------------------------------------------------

describe('compareDeclaredVsRoles', () => {
  it('returns null when the sets are equal', () => {
    const r = compareDeclaredVsRoles(new Set(['button']), new Set(['button']));
    expect(r).toBeNull();
  });

  it('reports impl roles that the manifest does not declare', () => {
    const r = compareDeclaredVsRoles(new Set(['button']), new Set(['button', 'combobox']));
    expect(r?.rolesNotDeclared).toEqual(['combobox']);
    expect(r?.patternsNotInImpl).toEqual([]);
  });

  it('reports patterns declared but absent from impl', () => {
    const r = compareDeclaredVsRoles(new Set(['button', 'tooltip']), new Set(['button']));
    expect(r?.rolesNotDeclared).toEqual([]);
    expect(r?.patternsNotInImpl).toEqual(['tooltip']);
  });
});

// ---------------------------------------------------------------------------
// resolveImplFile
// ---------------------------------------------------------------------------

describe('resolveImplFile', () => {
  it('returns the absolute manifest.file when it exists', async () => {
    const abs = path.join(uiKitSrc, 'pixel-button.tsx');
    const fsStub = stubFs({ [abs]: '<button role="button" />' });
    const out = await resolveImplFile(
      { component: 'PixelButton', file: abs },
      makeCtx([]),
      { pathExists: fsStub.pathExists },
    );
    expect(out).toBe(abs);
  });

  it('falls back to ui-kit/src/<Component>.tsx when manifest.file is absent', async () => {
    const abs = path.join(uiKitSrc, 'PixelButton.tsx');
    const fsStub = stubFs({ [abs]: '<button role="button" />' });
    const out = await resolveImplFile(
      { component: 'PixelButton' },
      makeCtx([]),
      { pathExists: fsStub.pathExists },
    );
    expect(out).toBe(abs);
  });

  it('returns null when nothing resolves', async () => {
    const fsStub = stubFs({});
    const out = await resolveImplFile(
      { component: 'PixelGhost' },
      makeCtx([]),
      { pathExists: fsStub.pathExists },
    );
    expect(out).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Gate.run — end-to-end against mocked AuditContext
// ---------------------------------------------------------------------------

describe('A11yPatternDeclaredGate.run', () => {
  it('passes vacuously when there are no manifests', async () => {
    const fsStub = stubFs({});
    const g = new A11yPatternDeclaredGate(fsStub);
    const r = await g.run(makeCtx([]));
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
    expect(r.name).toBe('a11y-pattern-declared');
    expect(typeof r.duration_ms).toBe('number');
  });

  it('passes when a presentational component has no a11y block (no name hint)', async () => {
    const fsStub = stubFs({});
    const g = new A11yPatternDeclaredGate(fsStub);
    const r = await g.run(
      makeCtx([
        mkManifest({ component: 'PixelBox' }),
      ]),
    );
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
  });

  it('passes when interactive: true is opted out via false', async () => {
    const fsStub = stubFs({});
    const g = new A11yPatternDeclaredGate(fsStub);
    const r = await g.run(
      makeCtx([
        mkManifest({ component: 'PixelButton', interactive: false }),
      ]),
    );
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
  });

  it('FIXTURE: combobox declared as button — flags MAJOR mismatch (the brief example)', async () => {
    // This is the canonical violation called out in the brief:
    //   "a Combobox with manifest.a11y.patterns=['button'] is wrong, should
    //    be ['combobox']".
    const implPath = path.join(uiKitSrc, 'PixelCombobox.tsx');
    const implSource = `
      import React from 'react';
      export function PixelCombobox(props) {
        return (
          <div role="combobox" aria-expanded={props.open}>
            <input role="searchbox" />
          </div>
        );
      }
    `;
    const fsStub = stubFs({ [implPath]: implSource });
    const g = new A11yPatternDeclaredGate(fsStub);
    const r = await g.run(
      makeCtx([
        mkManifest({
          component: 'PixelCombobox',
          file: implPath,
          a11y: { patterns: ['button'] },
        }),
      ]),
    );
    expect(r.passed).toBe(false);
    // No structural violation (button is a known token, shape is valid) —
    // the failure must come from the cross-reference mismatch.
    expect(r.findings).toHaveLength(1);
    const finding = r.findings[0]!;
    expect(finding.severity).toBe('major');
    expect(finding.component).toBe('PixelCombobox');
    expect(finding.file).toBe(implPath);
    expect(finding.message).toMatch(/mismatch/i);
    expect(finding.message).toMatch(/combobox/);
    expect(finding.message).toMatch(/button/);
    // Actionable suggestion must include the impl-derived patterns.
    expect(finding.suggestion).toMatch(/combobox/);
    expect(finding.suggestion).toMatch(/searchbox/);
  });

  it('flags MAJOR when an interactive component has no a11y block at all', async () => {
    const implPath = path.join(uiKitSrc, 'PixelMenu.tsx');
    const fsStub = stubFs({ [implPath]: `<ul role="menu"><li role="menuitem"/></ul>` });
    const g = new A11yPatternDeclaredGate(fsStub);
    const r = await g.run(
      makeCtx([
        mkManifest({ component: 'PixelMenu', file: implPath }),
      ]),
    );
    expect(r.passed).toBe(false);
    // Two findings: missing-a11y-block + cross-ref mismatch (impl declares
    // roles, manifest declares nothing).
    const kinds = r.findings.map((f) => f.message).join(' :: ');
    expect(kinds).toMatch(/no `a11y` block/);
    expect(kinds).toMatch(/mismatch/);
    expect(r.findings.every((f) => f.severity === 'major')).toBe(true);
  });

  it('flags MAJOR for typo in pattern token with "did you mean?" suggestion', async () => {
    const fsStub = stubFs({});
    const g = new A11yPatternDeclaredGate(fsStub);
    const r = await g.run(
      makeCtx([
        mkManifest({
          component: 'PixelCombobox',
          a11y: { patterns: ['cobobox'] },
        }),
      ]),
    );
    expect(r.passed).toBe(false);
    const f = r.findings.find((x) => x.message.includes('cobobox'));
    expect(f).toBeDefined();
    expect(f!.severity).toBe('major');
    expect(f!.suggestion).toMatch(/combobox/);
  });

  it('flags MAJOR when patterns is declared as a string instead of an array', async () => {
    const fsStub = stubFs({});
    const g = new A11yPatternDeclaredGate(fsStub);
    const r = await g.run(
      makeCtx([
        mkManifest({
          component: 'PixelButton',
          a11y: { patterns: 'button' },
        }),
      ]),
    );
    expect(r.passed).toBe(false);
    const f = r.findings.find((x) => x.message.includes('expected an array'));
    expect(f).toBeDefined();
    expect(f!.severity).toBe('major');
  });

  it('flags MAJOR when patterns is an empty array', async () => {
    const fsStub = stubFs({});
    const g = new A11yPatternDeclaredGate(fsStub);
    const r = await g.run(
      makeCtx([
        mkManifest({
          component: 'PixelButton',
          a11y: { patterns: [] },
        }),
      ]),
    );
    expect(r.passed).toBe(false);
    expect(r.findings).toHaveLength(1);
    expect(r.findings[0]!.message).toMatch(/empty array/);
    expect(r.findings[0]!.severity).toBe('major');
  });

  it('passes when manifest and impl agree exactly (declared = roles)', async () => {
    const implPath = path.join(uiKitSrc, 'PixelButton.tsx');
    const implSource = `<button role="button" type={type} />`;
    const fsStub = stubFs({ [implPath]: implSource });
    const g = new A11yPatternDeclaredGate(fsStub);
    const r = await g.run(
      makeCtx([
        mkManifest({
          component: 'PixelButton',
          file: implPath,
          a11y: { patterns: ['button'] },
        }),
      ]),
    );
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
  });

  it('skips cross-ref when no impl file resolves (degrades, does not crash)', async () => {
    const fsStub = stubFs({});
    const g = new A11yPatternDeclaredGate(fsStub);
    const r = await g.run(
      makeCtx([
        mkManifest({
          component: 'PixelButton',
          a11y: { patterns: ['button'] },
        }),
      ]),
    );
    // No structural violation, no impl to compare against → pass.
    expect(r.passed).toBe(true);
    expect(r.findings).toEqual([]);
  });

  it('treats a missing role= AND a declared pattern as a mismatch the user must resolve', async () => {
    const implPath = path.join(uiKitSrc, 'PixelTooltip.tsx');
    const implSource = `<div className="tooltip">{children}</div>`;
    const fsStub = stubFs({ [implPath]: implSource });
    const g = new A11yPatternDeclaredGate(fsStub);
    const r = await g.run(
      makeCtx([
        mkManifest({
          component: 'PixelTooltip',
          file: implPath,
          a11y: { patterns: ['tooltip'] },
        }),
      ]),
    );
    expect(r.passed).toBe(false);
    const f = r.findings[0]!;
    expect(f.severity).toBe('major');
    expect(f.message).toMatch(/tooltip/);
    expect(f.message).toMatch(/no matching role in impl/);
  });

  it('exposes id, name, description matching the contract', () => {
    const g = new A11yPatternDeclaredGate();
    expect(g.id).toBe(28);
    expect(g.name).toBe('a11y-pattern-declared');
    expect(g.description.toLowerCase()).toContain('a11y');
    expect(g.description.toLowerCase()).toContain('role');
  });

  it('default export is a usable singleton with the same contract', () => {
    expect(gate.id).toBe(28);
    expect(gate.name).toBe('a11y-pattern-declared');
    expect(typeof gate.run).toBe('function');
  });
});
