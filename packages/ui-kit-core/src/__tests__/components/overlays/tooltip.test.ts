import { describe, expect, it } from 'vitest';
import {
  POPOVER_Z_INDEX,
  TOOLTIP_DEFAULT_DELAYS,
  TOOLTIP_Z_INDEX,
  resolveTooltipDelays,
  surfaceClasses,
  tooltipClasses,
  tooltipTriggerClasses,
} from '../../../index';

describe('tooltip delays', () => {
  it('opens after 200 ms and closes after 100 ms by default', () => {
    expect(TOOLTIP_DEFAULT_DELAYS).toEqual({ open: 200, close: 100 });
    expect(resolveTooltipDelays()).toEqual({ open: 200, close: 100 });
    expect(resolveTooltipDelays({})).toEqual({ open: 200, close: 100 });
  });

  it('reads a bare number as the open delay', () => {
    expect(resolveTooltipDelays(300)).toEqual({ open: 300, close: 100 });
    expect(resolveTooltipDelays(0)).toEqual({ open: 0, close: 100 });
  });

  it('keeps the default for a delay left out of the object', () => {
    expect(resolveTooltipDelays({ open: 600 })).toEqual({ open: 600, close: 100 });
    expect(resolveTooltipDelays({ close: 0 })).toEqual({ open: 200, close: 0 });
    expect(resolveTooltipDelays({ open: 0, close: 0 })).toEqual({ open: 0, close: 0 });
  });
});

describe('tooltip recipes', () => {
  it('floats on the popover layer, anchored to an inline wrapper', () => {
    expect(TOOLTIP_Z_INDEX).toBe(POPOVER_Z_INDEX);
    expect(tooltipTriggerClasses).toBe('relative inline-flex');
  });

  it('lets the pointer through hover and focus tooltips but not click ones', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      for (const trigger of ['hover', 'focus'] as const) {
        expect(tooltipClasses(surface, trigger).split(' ')).toContain('pointer-events-none');
      }
      const click = tooltipClasses(surface, 'click');
      expect(click).not.toContain('pointer-events-none');
      expect(click).toContain(`${s.border} ${s.radius} ${s.font} border-retro-border`);
      expect(click.startsWith('w-max max-w-[calc(100vw-16px)] break-words')).toBe(true);
    }
  });
});
