import { describe, expect, it } from 'vitest';
import {
  SPLIT_BUTTON_MENU_ROOM,
  SPLIT_BUTTON_TOGGLE_LABEL,
  splitButtonGroupClasses,
  splitButtonItemClasses,
  splitButtonItemId,
  splitButtonMenuAlignsRight,
  splitButtonMenuClasses,
  splitButtonPrimaryClasses,
  splitButtonRootClasses,
  splitButtonToggleClasses,
  surfaceClasses,
  toneMap,
} from '../../../index';

const classesOf = (value: string) => value.split(' ').filter(Boolean);

describe('split button recipes', () => {
  it('joins the two buttons in a tone frame drawn with the surface tokens', () => {
    expect(splitButtonRootClasses).toBe('relative inline-flex');
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      expect(splitButtonGroupClasses(surface, 'cyan')).toBe(
        `inline-flex overflow-hidden ${s.border} ${s.radius} ${toneMap.cyan.border}`,
      );
    }
  });

  it('flattens the primary button into the frame, focus drawn inside it', () => {
    expect(classesOf(splitButtonPrimaryClasses)).toEqual([
      'rounded-none',
      'border-0',
      'shadow-none',
      'hover:shadow-none',
      'active:shadow-none',
      'hover:translate-x-0',
      'hover:translate-y-0',
      'active:translate-x-0',
      'active:translate-y-0',
      'focus-visible:pxl-focus-inset',
    ]);
  });

  it('fills the chevron button with the tone, behind a divider, dimmed while disabled', () => {
    const t = toneMap.purple;
    expect(splitButtonToggleClasses('linear', 'purple')).toBe(
      `flex items-center border-0 border-l px-2 focus-visible:pxl-focus-inset disabled:opacity-50 disabled:cursor-not-allowed ${surfaceClasses('linear').transition} ${t.border} ${t.bg} ${t.hover} ${t.text}`,
    );
    expect(SPLIT_BUTTON_TOGGLE_LABEL).toBe('More options');
  });

  it('draws keyboard focus inside both buttons on both surfaces, as the frame clips them', () => {
    expect(splitButtonGroupClasses('linear', 'green')).toContain('overflow-hidden');
    for (const surface of ['pixel', 'linear'] as const) {
      expect(classesOf(splitButtonToggleClasses(surface, 'green'))).toContain('focus-visible:pxl-focus-inset');
    }
    expect(classesOf(splitButtonPrimaryClasses)).toContain('focus-visible:pxl-focus-inset');
  });

  it('places the menu below the root, aligned with either edge', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const base = 'absolute top-full z-40 mt-1 min-w-40 max-w-[calc(100vw-1rem)] bg-retro-bg p-1 shadow-xl';
      const frame = `${s.border} ${s.radiusLg} border-retro-border-strong`;
      expect(splitButtonMenuClasses(surface, false)).toBe(`${base} left-0 ${frame}`);
      expect(splitButtonMenuClasses(surface, true)).toBe(`${base} right-0 ${frame}`);
    }
  });

  it('fills the highlighted option, in the surface font and radius', () => {
    const s = surfaceClasses('pixel');
    const idle = splitButtonItemClasses('pixel', false);
    expect(idle.endsWith(`hover:text-retro-text ${s.font} ${s.radius}`)).toBe(true);
    expect(classesOf(idle)).not.toContain('bg-retro-surface');
    expect(classesOf(splitButtonItemClasses('pixel', true))).toEqual([
      ...classesOf(idle).slice(0, -2),
      'bg-retro-surface',
      'text-retro-text',
      s.font,
      s.radius,
    ]);
  });

  it('opens the menu from the right edge when it would overflow the viewport', () => {
    expect(SPLIT_BUTTON_MENU_ROOM).toBe(168);
    expect(splitButtonMenuAlignsRight(0, 1024)).toBe(false);
    expect(splitButtonMenuAlignsRight(856, 1024)).toBe(false);
    expect(splitButtonMenuAlignsRight(857, 1024)).toBe(true);
  });

  it('gives each option an id within the menu', () => {
    expect(splitButtonItemId('menu', 0)).toBe('menu-0');
    expect(splitButtonItemId(':r1:', 2)).toBe(':r1:-2');
  });
});
