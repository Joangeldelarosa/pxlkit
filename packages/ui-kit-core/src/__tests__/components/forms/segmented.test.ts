import { describe, expect, it } from 'vitest';
import {
  focusRing,
  segmentClasses,
  segmentedClasses,
  segmentedGroupName,
  surfaceClasses,
  toneMap,
  type Surface,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];

describe('segmented recipes', () => {
  it('captions a bordered row of segments, dimmed while disabled', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const c = segmentedClasses(surface, false);
      expect(c.root).toBe('space-y-1.5');
      expect(c.label).toBe(`text-xs text-retro-muted ${s.font}`);
      expect(c.track).toBe(
        `inline-flex max-w-full overflow-x-auto bg-retro-surface/50 p-0.5 ${s.border} ${s.radius} border-retro-border-strong/60`,
      );
      expect(segmentedClasses(surface, true).root).toBe('space-y-1.5 opacity-50 cursor-not-allowed');
    }
  });

  it('fills the active segment with its tone and mutes the others', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const t = toneMap.purple;
      const base = `px-3 py-1.5 text-xs outline-none whitespace-nowrap ${s.font} ${s.radius} ${s.transition} ${focusRing} ${t.ring}`;
      expect(segmentClasses(surface, { tone: 'purple', active: true, disabled: false })).toBe(
        `${base} ${t.bg} ${t.text} border border-transparent shadow-sm`,
      );
      expect(segmentClasses(surface, { tone: 'purple', active: false, disabled: true })).toBe(
        `${base} border border-transparent text-retro-muted hover:text-retro-text cursor-not-allowed`,
      );
    }
  });

  it('names the segments by the aria-label, else the visible label', () => {
    expect(segmentedGroupName('Range', 'View')).toBe('Range');
    expect(segmentedGroupName(undefined, 'View')).toBe('View');
    expect(segmentedGroupName('', '')).toBeUndefined();
    expect(segmentedGroupName(undefined, undefined)).toBeUndefined();
  });
});
