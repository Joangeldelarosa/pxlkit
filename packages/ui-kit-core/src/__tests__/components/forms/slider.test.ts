import { describe, expect, it } from 'vitest';
import {
  focusRing,
  isSliderRange,
  moveSliderThumb,
  nearestSliderThumb,
  sliderClasses,
  sliderFill,
  sliderKeyValue,
  sliderPercent,
  sliderThumbLabel,
  sliderThumbLeft,
  sliderThumbValues,
  sliderTicks,
  sliderTooltipVisible,
  sliderValueAt,
  sliderValueText,
  snapSliderValue,
  surfaceClasses,
  toneMap,
  type Surface,
} from '../../../index';

const bounds = { min: 0, max: 100, step: 1 };

describe('slider value math', () => {
  it('tells a range from a single value, and reads both thumbs', () => {
    expect(isSliderRange([20, 80])).toBe(true);
    expect(isSliderRange(40)).toBe(false);
    expect(sliderThumbValues([20, 80])).toEqual([20, 80]);
    expect(sliderThumbValues(40)).toEqual([40, 40]);
  });

  it('snaps to multiples of the step, then clamps to the bounds', () => {
    expect(snapSliderValue(42.4, bounds)).toBe(42);
    expect(snapSliderValue(42.5, bounds)).toBe(43);
    expect(snapSliderValue(73, { min: 0, max: 200, step: 5 })).toBe(75);
    expect(snapSliderValue(-12, bounds)).toBe(0);
    expect(snapSliderValue(140, bounds)).toBe(100);
    // Multiples of the step from zero, not from the minimum.
    expect(snapSliderValue(13, { min: 5, max: 100, step: 10 })).toBe(10);
  });

  it('moves a single thumb to the snapped value', () => {
    expect(moveSliderThumb(40, 0, 51.2, bounds)).toBe(51);
    expect(moveSliderThumb(40, 1, 120, bounds)).toBe(100);
  });

  it('moves one thumb of a range, stopping it at the other', () => {
    expect(moveSliderThumb([20, 80], 0, 21, bounds)).toEqual([21, 80]);
    expect(moveSliderThumb([20, 80], 1, 79.6, bounds)).toEqual([20, 80]);
    expect(moveSliderThumb([78, 80], 0, 100, bounds)).toEqual([80, 80]);
    expect(moveSliderThumb([20, 22], 1, 3, bounds)).toEqual([20, 20]);
  });

  it('maps the arrows, pages, Home and End to values within the bounds', () => {
    expect(sliderKeyValue('ArrowRight', 50, bounds)).toBe(51);
    expect(sliderKeyValue('ArrowUp', 100, bounds)).toBe(100);
    expect(sliderKeyValue('ArrowLeft', 50, bounds)).toBe(49);
    expect(sliderKeyValue('ArrowDown', 0, bounds)).toBe(0);
    expect(sliderKeyValue('PageUp', 50, { min: 0, max: 200, step: 5 })).toBe(100);
    expect(sliderKeyValue('PageUp', 95, bounds)).toBe(100);
    expect(sliderKeyValue('PageDown', 50, bounds)).toBe(40);
    expect(sliderKeyValue('PageDown', 5, bounds)).toBe(0);
    expect(sliderKeyValue('Home', 50, bounds)).toBe(0);
    expect(sliderKeyValue('End', 50, bounds)).toBe(100);
    expect(sliderKeyValue('Enter', 50, bounds)).toBeUndefined();
  });

  it('places values on the track in percent, kept within it', () => {
    expect(sliderPercent(40, 0, 100)).toBe(40);
    expect(sliderPercent(75, 0, 200)).toBe(37.5);
    expect(sliderPercent(-5, 0, 100)).toBe(0);
    expect(sliderPercent(150, 0, 100)).toBe(100);
    expect(sliderThumbLeft(37.5)).toBe('calc(37.5% - 8px)');
  });

  it('reads the value under the pointer, kept within the track', () => {
    const track = { left: 100, width: 200 };
    expect(sliderValueAt(200, track, 0, 100)).toBe(50);
    expect(sliderValueAt(150, track, 0, 200)).toBe(50);
    expect(sliderValueAt(0, track, 0, 100)).toBe(0);
    expect(sliderValueAt(999, track, 0, 100)).toBe(100);
  });

  it('grabs the nearer thumb, the lower one on a tie', () => {
    expect(nearestSliderThumb(40, 90)).toBe(0);
    expect(nearestSliderThumb([20, 80], 30)).toBe(0);
    expect(nearestSliderThumb([20, 80], 70)).toBe(1);
    expect(nearestSliderThumb([20, 80], 50)).toBe(0);
  });

  it('fills from the start to the thumb, or between the thumbs of a range', () => {
    expect(sliderFill(40, 0, 100)).toEqual({ left: 0, width: 40 });
    expect(sliderFill([20, 80], 0, 100)).toEqual({ left: 20, width: 60 });
    expect(sliderFill([30, 30], 0, 100)).toEqual({ left: 30, width: 0 });
  });

  it('puts a tick on every step, at most 51 of them', () => {
    expect(sliderTicks({ min: 0, max: 100, step: 10 })).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    expect(sliderTicks({ min: 0, max: 10, step: 1 })).toHaveLength(11);
    const dense = sliderTicks({ min: 0, max: 1000, step: 1 });
    expect(dense).toHaveLength(51);
    expect(dense[1]).toBe(20);
    expect(sliderTicks({ min: 0, max: 10, step: 20 })).toEqual([]);
  });

  it('labels the value, the thumbs and when a thumb shows its value', () => {
    expect(sliderValueText(40)).toBe('40');
    expect(sliderValueText([20, 80])).toBe('20 – 80');
    expect(sliderThumbLabel('Volume', false, 0)).toBe('Volume');
    expect(sliderThumbLabel('Price', true, 0)).toBe('Price minimum');
    expect(sliderThumbLabel('Price', true, 1)).toBe('Price maximum');
    expect(sliderTooltipVisible('always', null, 1)).toBe(true);
    expect(sliderTooltipVisible('never', 0, 0)).toBe(false);
    expect(sliderTooltipVisible('drag', 0, 0)).toBe(true);
    expect(sliderTooltipVisible('drag', 1, 0)).toBe(false);
    expect(sliderTooltipVisible('drag', null, 0)).toBe(false);
  });
});

describe('slider recipes', () => {
  const SURFACES: Surface[] = ['pixel', 'linear'];

  it('rounds the track, fill and thumbs per surface, in the tone given', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const rounded = surface === 'pixel' ? 'rounded-[2px]' : 'rounded-full';
      const c = sliderClasses(surface, { tone: 'gold', disabled: false });
      expect(c.root).toBe('space-y-2');
      expect(c.header).toBe(`flex items-center justify-between text-xs text-retro-muted ${s.font}`);
      expect(c.value).toBe(toneMap.gold.text);
      expect(c.track).toBe(
        `group relative h-2.5 outline-none touch-none border border-retro-border-strong bg-retro-surface/50 ${rounded} cursor-pointer`,
      );
      expect(c.fill).toBe(`absolute inset-y-0 transition-[width] ${rounded} ${toneMap.gold.bg}`);
      expect(c.thumb).toBe(
        [
          'absolute top-1/2 h-4 w-4 -translate-y-1/2 border-2 bg-retro-bg shadow-md transition-shadow outline-none',
          rounded,
          'group-hover:shadow-[0_0_0_3px_rgba(0,0,0,.15)]',
          focusRing,
          toneMap.gold.ring,
          toneMap.gold.border,
        ].join(' '),
      );
      expect(c.tooltip).toContain(`${s.font} ${s.border} ${s.radius} border-retro-border-strong`);
      expect(c.mark).toBe(`absolute top-0 -translate-x-1/2 text-[10px] text-retro-muted ${s.font}`);
      expect(c.bounds).toBe(`flex justify-between text-[10px] text-retro-muted/50 ${s.font}`);
    }
  });

  it('fades a disabled slider and drops the hover halo', () => {
    const c = sliderClasses('pixel', { tone: 'cyan', disabled: true });
    expect(c.root).toBe('space-y-2 opacity-50');
    expect(c.track).toContain('cursor-not-allowed');
    expect(c.thumb).not.toContain('group-hover:');
    expect(c.ticks).toBe('relative h-2');
    expect(c.tick).toBe('absolute top-0 h-1.5 w-px bg-retro-muted/40');
    expect(c.marks).toBe('relative h-4');
  });
});
