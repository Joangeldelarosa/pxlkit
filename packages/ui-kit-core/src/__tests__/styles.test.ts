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
