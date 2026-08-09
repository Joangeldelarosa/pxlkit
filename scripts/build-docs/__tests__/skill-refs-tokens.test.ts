/**
 * Unit tests for the tokens & theming skill reference renderer.
 *
 * Strategy: feed synthetic (but shape-accurate) slices of `styles.css`,
 * `tokens.ts` and `common.tsx` so the tests never depend on the current
 * palette values, and assert on the guarantees a consuming skill relies on:
 * light/dark pairing, the two-tone-scale warning, the surface table, the
 * size scales and the re-skin recipe.
 */

import { describe, expect, it } from 'vitest';
import { renderTokensReference } from '../skill-refs/tokens';

const stylesCss = `:root { --retro-bg: #FFFFFF; --retro-green: #00A862; }
.dark { --retro-bg: #0A0A0F; --retro-green: #00FF88; }`;

/** Shape-accurate slice of packages/ui-kit/styles.css (comments + @layer + .light). */
const realisticCss = `@layer base {
  :root, :host {
    /* --retro-bg: #DECOY; a commented-out value must never win */
    --retro-bg: #F2F0EB;
    --retro-border-strong: #8C8770;
    --retro-shadow-green: rgba(0, 140, 75, 0.3);
  }

  .dark {
    --retro-bg: #0A0A0F;
    --retro-border-strong: #4A4A66;
    --retro-shadow-green: rgba(0, 255, 136, 0.3);
    /* Tailwind v4 @theme re-declarations. */
    --color-retro-bg: #0A0A0F;
  }

  .light {
    --retro-bg: #F2F0EB;
    --retro-only-in-light: #ABCABC;
  }
}`;

const tokensTs = `export const tone = {
  neutral: { border: 'border-retro-border', glow: 'shadow-[0_0_24px_-12px_rgba(0,0,0,0.4)]' },
  green: { border: 'border-retro-green/30', glow: 'shadow-[0_0_24px_-8px_rgba(0,255,128,0.45)]' },
} as const;`;

const commonTsx = `export const toneMap: Record<Tone, { ring: string; border: string }> = {
  green: { ring: 'focus-visible:ring-retro-green/40', border: 'border-retro-green/40' },
  neutral: { ring: 'focus-visible:ring-retro-border/60', border: 'border-retro-border' },
};

const SURFACE_TOKENS: Record<Surface, SurfaceClasses> = {
  pixel: {
    border: 'border-2',
    radius: 'pxl-corner-sm',
    shadow: 'pxl-shadow',
    font: 'font-mono',
    press: 'active:translate-x-[2px] active:translate-y-[2px]',
  },
  linear: {
    border: 'border',
    radius: 'rounded-md',
    shadow: 'shadow-sm',
    font: 'font-sans',
    press: 'active:scale-[0.98]',
  },
};

export const sizeClass: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-sm gap-2.5',
};

export const sizeHeight: Record<Size, string> = {
  sm: 'h-8 text-xs',
  md: 'h-10 text-sm',
  lg: 'h-12 text-sm',
};

export const sizeSquare: Record<Size, string> = {
  sm: 'h-8 w-8 text-[9px]',
  md: 'h-10 w-10 text-[10px]',
  lg: 'h-12 w-12 text-xs',
};`;

const minimalSources = {
  tokensTs: 'export const tone = {}',
  commonTsx: 'export const toneMap = {}',
  stylesCss,
};

const realisticSources = { tokensTs, commonTsx, stylesCss: realisticCss };

describe('renderTokensReference', () => {
  it('extracts light and dark values for the same variable', () => {
    const out = renderTokensReference(minimalSources, '2.1.1');
    expect(out).toContain('--retro-bg');
    expect(out).toContain('#FFFFFF');
    expect(out).toContain('#0A0A0F');
  });

  it('warns that the two tone scales are not interchangeable', () => {
    const out = renderTokensReference(minimalSources, '2.1.1');
    expect(out.toLowerCase()).toContain('not interchangeable');
  });

  it('emits a generated-file header naming the source version', () => {
    const out = renderTokensReference(minimalSources, '2.1.1');
    expect(out).toContain('GENERATED from @pxlkit/ui-kit v2.1.1');
    expect(out).toContain('do not edit');
  });

  it('uses the literal English warning sentence', () => {
    const out = renderTokensReference(minimalSources, '2.1.1');
    expect(out).toContain('The two tone scales are NOT interchangeable');
  });

  it('parses variables out of nested @layer blocks and ignores commented values', () => {
    const out = renderTokensReference(realisticSources, '2.1.1');
    expect(out).toContain('--retro-border-strong');
    expect(out).toContain('#8C8770');
    expect(out).toContain('#4A4A66');
    expect(out).toContain('rgba(0, 255, 136, 0.3)');
    expect(out).not.toContain('#DECOY');
  });

  it('does not treat the --color-retro-* @theme re-declarations as tokens', () => {
    const out = renderTokensReference(realisticSources, '2.1.1');
    expect(out).not.toContain('--color-retro-bg');
  });

  it('falls back to the .light block for variables absent from :root', () => {
    const out = renderTokensReference(realisticSources, '2.1.1');
    expect(out).toContain('--retro-only-in-light');
    expect(out).toContain('#ABCABC');
  });

  it('labels toneMap as the control scale and tokens tone as the surface scale', () => {
    const out = renderTokensReference(realisticSources, '2.1.1');
    expect(out).toContain('toneMap');
    expect(out).toContain('common.tsx');
    expect(out).toContain('tokens.ts');
    expect(out).toMatch(/CONTROLS/);
    expect(out).toMatch(/SURFACES/);
  });

  it('lists the real keys of both tone scales', () => {
    const out = renderTokensReference(realisticSources, '2.1.1');
    const controlLine = out.split('\n').find((l) => l.includes('toneMap') && l.includes('keys'));
    expect(controlLine).toBeDefined();
    expect(controlLine).toContain('green');
    expect(controlLine).toContain('neutral');
  });

  it('renders surfaceClasses as a pixel vs linear table', () => {
    const out = renderTokensReference(realisticSources, '2.1.1');
    expect(out).toContain('surfaceClasses');
    expect(out).toContain('| `border` | `border-2` | `border` |');
    expect(out).toContain('pxl-corner-sm');
    expect(out).toContain('rounded-md');
    expect(out).toContain('font-mono');
    expect(out).toContain('font-sans');
  });

  it('renders the three size scales with their values', () => {
    const out = renderTokensReference(realisticSources, '2.1.1');
    expect(out).toContain('sizeClass');
    expect(out).toContain('sizeHeight');
    expect(out).toContain('sizeSquare');
    expect(out).toContain('h-10 px-4 text-sm gap-2');
    expect(out).toContain('h-12 w-12 text-xs');
  });

  it('documents the re-skin recipe with its two gotchas', () => {
    const out = renderTokensReference(realisticSources, '2.1.1');
    expect(out).toContain('@import "@pxlkit/ui-kit/styles.css"');
    expect(out).toContain('@property');
    expect(out).toContain('--retro-shadow-green');
    expect(out).toContain('--retro-shadow-gold');
    // Both re-declaration selectors must be named, not just :root.
    expect(out).toContain('.dark');
    expect(out).toContain('.light');
  });

  it('degrades gracefully when a source cannot be parsed', () => {
    const out = renderTokensReference(
      { tokensTs: '', commonTsx: '', stylesCss: '' },
      '2.1.1',
    );
    expect(out).toContain('The two tone scales are NOT interchangeable');
    expect(out.length).toBeGreaterThan(0);
  });
});
