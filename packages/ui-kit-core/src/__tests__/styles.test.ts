import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const theme = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../styles.css'), 'utf8');

/** The declarations of the first block whose prelude matches. */
function block(prelude: RegExp): string | undefined {
  const match = prelude.exec(theme);
  if (!match) return undefined;
  const open = theme.indexOf('{', match.index + match[0].length - 1);
  return theme.slice(open + 1, theme.indexOf('}', open)).trim();
}

describe('keyboard focus on the pixel surface', () => {
  it('draws the focus indicator as an outline in the text colour, inside the border box', () => {
    const utility = block(/@utility pxl-focus-inset\s*\{/);
    expect(utility).toBeDefined();
    expect(utility).toMatch(/outline:\s*2px solid var\(--pxl-focus-color, currentColor\);/);
    expect(utility).toMatch(/outline-offset:\s*-2px;/);
  });

  it('draws it in the highlight colour in forced-colors mode, which paints a border and the text alike', () => {
    expect(block(/@media \(forced-colors: active\)\s*\{\s*:root, :host\s*\{/)).toBe('--pxl-focus-color: Highlight;');
  });

  it('draws it on every cut-corner element, whose clip-path cuts off a focus ring around it', () => {
    const corners = [...theme.matchAll(/^\s*\.(pxl-corner-[a-z]+)\s*\{/gm)].map((m) => m[1]);
    expect(corners).toEqual(['pxl-corner-sm', 'pxl-corner-md', 'pxl-corner-lg']);
    for (const name of corners) expect(block(new RegExp(`^\\s*\\.${name}\\s*\\{`, 'm'))).toMatch(/clip-path:/);
    const rule = block(new RegExp(corners.map((name) => `\\.${name}:focus-visible`).join(',\\s*') + '\\s*\\{'));
    expect(rule).toBe('@apply pxl-focus-inset;');
  });
});

describe('pixel shadows and moves', () => {
  it('keeps the drop-shadow utilities as they are', () => {
    expect(block(/^\s*\.pxl-shadow\s*\{/m)).toBe('filter: drop-shadow(3px 3px 0 rgba(0, 0, 0, 0.25));');
    expect(block(/^\s*\.pxl-shadow-hover:hover\s*\{/m)).toMatch(/filter: drop-shadow\(2px 2px 0 [^;]+\);\s*transform: translate\(1px, 1px\);/);
    expect(block(/^\s*\.pxl-shadow-active:active\s*\{/m)).toMatch(/filter: drop-shadow\(1px 1px 0 [^;]+\);\s*transform: translate\(2px, 2px\);/);
  });

  it('moves a cut-corner control on hover and press as the shadow utilities do, without a filter', () => {
    expect(block(/^\s*\.pxl-nudge-hover:hover\s*\{/m)).toBe('transform: translate(1px, 1px);');
    expect(block(/^\s*\.pxl-nudge-active:active\s*\{/m)).toBe('transform: translate(2px, 2px);');
    // The press comes later, so a pressed control under the pointer moves 2px, not 1px.
    expect(theme.indexOf('.pxl-nudge-active:active')).toBeGreaterThan(theme.indexOf('.pxl-nudge-hover:hover'));
  });
});

describe('theme palettes', () => {
  it('re-declares every utility colour through its palette variable in .dark and .light, so an override reaches the utilities', () => {
    const tokens = block(/^@theme\s*\{/m);
    expect(tokens).toBeDefined();
    const names = [...tokens!.matchAll(/--color-(retro-[a-z-]+):\s*var\(--\1\);/g)].map((m) => m[1]!);
    expect(names).toEqual(expect.arrayContaining(['retro-bg', 'retro-text', 'retro-green', 'retro-pink']));
    for (const selector of ['dark', 'light']) {
      const body = block(new RegExp(`^\\s*\\.${selector}\\s*\\{`, 'm'));
      expect(body).toBeDefined();
      const declared = new Map([...body!.matchAll(/--color-(retro-[a-z-]+):\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));
      for (const name of names) expect(declared.get(name), `.${selector} --color-${name}`).toBe(`var(--${name})`);
    }
  });
});
