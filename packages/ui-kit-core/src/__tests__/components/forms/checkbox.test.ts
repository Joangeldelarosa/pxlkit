import { describe, expect, it } from 'vitest';
import { checkboxClasses, indicatorFocusClasses, surfaceClasses, toneMap, type Surface, type Tone } from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];
const TONES: Tone[] = ['green', 'cyan', 'gold', 'red', 'purple', 'pink', 'neutral'];

describe('checkbox recipes', () => {
  it('fills a checked box with its tone and draws the check mark in it', () => {
    for (const surface of SURFACES) {
      for (const tone of TONES) {
        const t = toneMap[tone];
        const c = checkboxClasses(surface, { tone, checked: true, disabled: false });
        expect(c.box).toContain(`${surfaceClasses(surface).border} ${surfaceClasses(surface).radius} ${t.border} ${t.bg}`);
        expect(c.check).toBe(t.text);
      }
    }
  });

  it('leaves an unchecked box empty and hover-reactive', () => {
    const c = checkboxClasses('pixel', { tone: 'green', checked: false, disabled: false });
    expect(c.box).toContain('border-retro-border-strong bg-retro-bg group-hover:border-retro-muted');
    expect(c.button).toBe(`group flex items-center gap-2.5 text-sm focus-visible:outline-hidden ${surfaceClasses('pixel').font} cursor-pointer`);
    expect(c.label).toBe('text-retro-text select-none');
  });

  it("draws the button's keyboard focus on the box: a ring in the tone, or inside the cut corners on the pixel surface", () => {
    for (const tone of TONES) {
      const ring = toneMap[tone].ring.replace('focus-visible:', 'group-focus-visible:');
      const linear = checkboxClasses('linear', { tone, checked: false, disabled: false }).box.split(' ');
      expect(linear).toEqual(
        expect.arrayContaining(['group-focus-visible:ring-2', 'group-focus-visible:ring-offset-2', 'group-focus-visible:ring-offset-retro-bg', ring]),
      );
      const pixel = checkboxClasses('pixel', { tone, checked: true, disabled: false }).box.split(' ');
      expect(pixel).toEqual(expect.arrayContaining(['pxl-corner-sm', 'group-focus-visible:pxl-focus-inset']));
      expect(pixel.filter((c) => c.includes('ring'))).toEqual([]);
      for (const surface of SURFACES) {
        expect(checkboxClasses(surface, { tone, checked: false, disabled: false }).box).toContain(indicatorFocusClasses(surface, tone));
      }
    }
  });

  it('dims a disabled checkbox and stops reacting to hover', () => {
    const c = checkboxClasses('linear', { tone: 'green', checked: false, disabled: true });
    expect(c.button.endsWith('opacity-50 cursor-not-allowed')).toBe(true);
    expect(c.box).not.toContain('group-hover:border-retro-muted');
  });
});
