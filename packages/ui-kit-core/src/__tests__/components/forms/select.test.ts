import { describe, expect, it } from 'vitest';
import {
  focusRing,
  selectClasses,
  selectKeydown,
  selectListboxId,
  selectOptionClasses,
  selectOptionId,
  sizeHeight,
  surfaceClasses,
  toneMap,
  type SelectClassOptions,
  type Surface,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];
const closed: SelectClassOptions = { tone: 'neutral', size: 'md', invalid: false, disabled: false, open: false, hasValue: false };

describe('select recipes', () => {
  it('composes the trigger from the surface, size and tone, red with an error and dimmed while disabled', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      expect(selectClasses(surface, { ...closed, tone: 'cyan', size: 'sm' }).trigger).toBe(
        `flex w-full items-center justify-between bg-retro-surface/40 px-3 outline-none ${s.font} ${s.border} ${s.radius} ${s.transition} ${sizeHeight.sm} ${focusRing} ${toneMap.cyan.ring} border-retro-border-strong`,
      );
      expect(selectClasses(surface, { ...closed, invalid: true, disabled: true }).trigger).toContain(
        'border-retro-red/60 opacity-50 cursor-not-allowed',
      );
      expect(selectClasses(surface, closed).listbox).toContain(`${s.border} ${s.radiusLg} border-retro-border-strong`);
    }
  });

  it('mutes the placeholder and turns the chevron while open', () => {
    expect(selectClasses('pixel', closed).value).toBe('truncate text-retro-muted');
    expect(selectClasses('pixel', { ...closed, hasValue: true }).value).toBe('truncate text-retro-text');
    expect(selectClasses('pixel', closed).chevron).not.toContain('rotate-180');
    expect(selectClasses('pixel', { ...closed, open: true }).chevron).toContain('rotate-180');
    const c = selectClasses('linear', closed);
    expect([c.container, c.triggerContent, c.icon, c.optionContent, c.optionLabel, c.check]).toEqual([
      'relative',
      'flex min-w-0 items-center gap-2',
      'flex-shrink-0 opacity-80',
      'flex flex-1 min-w-0 items-center gap-2',
      'truncate',
      'ml-auto flex-shrink-0 h-2.5 w-2.5',
    ]);
  });

  it('tints the selected option with its tone and shades the highlighted one', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const t = toneMap.gold;
      expect(selectOptionClasses(surface, { tone: 'gold', selected: true, highlighted: true })).toBe(
        `flex w-full items-center px-3 py-2 text-left text-xs transition-colors ${s.font} ${s.radius} ${t.text} ${t.soft} bg-retro-surface hover:bg-retro-surface hover:text-retro-text`,
      );
      expect(selectOptionClasses(surface, { tone: 'gold', selected: false, highlighted: false })).toBe(
        `flex w-full items-center px-3 py-2 text-left text-xs transition-colors ${s.font} ${s.radius} text-retro-muted hover:bg-retro-surface hover:text-retro-text`,
      );
    }
  });

  it('derives the listbox and option ids from the trigger id', () => {
    expect(selectListboxId('fruit')).toBe('fruit-listbox');
    expect(selectOptionId('fruit', 2)).toBe('fruit-option-2');
  });
});

describe('select keyboard', () => {
  const at = (open: boolean, highlighted: number) => ({ open, highlighted });

  it('closes on Escape and Tab, keeping their default action and the highlight', () => {
    expect(selectKeydown('Escape', at(true, 1), 3)).toEqual({ preventDefault: false, open: false, highlighted: 1 });
    expect(selectKeydown('Tab', at(true, 2), 3)).toEqual({ preventDefault: false, open: false, highlighted: 2 });
  });

  it('opens with Enter or Space, and selects the highlighted option once open', () => {
    for (const key of ['Enter', ' ']) {
      expect(selectKeydown(key, at(false, 1), 3)).toEqual({ preventDefault: true, open: true, highlighted: 1 });
      expect(selectKeydown(key, at(true, -1), 3)).toEqual({ preventDefault: true, open: true, highlighted: -1 });
      expect(selectKeydown(key, at(true, 1), 3)).toEqual({ preventDefault: true, open: false, highlighted: 1, select: 1 });
    }
  });

  it('opens on the first option with ArrowDown, then moves down without wrapping', () => {
    expect(selectKeydown('ArrowDown', at(false, 2), 3)).toEqual({ preventDefault: true, open: true, highlighted: 0 });
    expect(selectKeydown('ArrowDown', at(true, -1), 3)).toEqual({ preventDefault: true, open: true, highlighted: 0 });
    expect(selectKeydown('ArrowDown', at(true, 2), 3)).toEqual({ preventDefault: true, open: true, highlighted: 2 });
  });

  it('moves up with ArrowUp without wrapping or opening', () => {
    expect(selectKeydown('ArrowUp', at(true, 2), 3)).toEqual({ preventDefault: true, open: true, highlighted: 1 });
    expect(selectKeydown('ArrowUp', at(true, 0), 3)).toEqual({ preventDefault: true, open: true, highlighted: 0 });
    expect(selectKeydown('ArrowUp', at(false, -1), 3)).toEqual({ preventDefault: true, open: false, highlighted: 0 });
  });

  it('opens on the first or last option with Home and End', () => {
    expect(selectKeydown('Home', at(false, 2), 3)).toEqual({ preventDefault: true, open: true, highlighted: 0 });
    expect(selectKeydown('End', at(false, 0), 3)).toEqual({ preventDefault: true, open: true, highlighted: 2 });
  });

  it('leaves every other key alone', () => {
    expect(selectKeydown('a', at(true, 0), 3)).toBeNull();
    expect(selectKeydown('PageDown', at(false, -1), 3)).toBeNull();
  });
});
