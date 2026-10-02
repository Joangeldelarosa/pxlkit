import { describe, expect, it } from 'vitest';
import { radioGroupClasses, radioIndicatorClasses, surfaceClasses, toneMap, type Surface } from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];

describe('radio group recipes', () => {
  it('stacks the radios under a legend in the surface font', () => {
    for (const surface of SURFACES) {
      const { font } = surfaceClasses(surface);
      const c = radioGroupClasses(surface, false);
      expect(c.group).toBe('space-y-2');
      expect(c.legend).toBe(`mb-1.5 text-xs text-retro-muted ${font}`);
      expect(c.radio).toBe(`group flex items-center gap-2.5 text-sm outline-none ${font} cursor-pointer`);
      expect(c.label).toBe('text-retro-text select-none');
      expect(radioGroupClasses(surface, true).radio.endsWith('opacity-50 cursor-not-allowed')).toBe(true);
    }
  });

  it('draws a square indicator on the pixel surface and a round one on the linear surface', () => {
    const pixel = radioIndicatorClasses('pixel', { tone: 'cyan', checked: true, disabled: false });
    expect(pixel.indicator).toContain('rounded-[2px]');
    expect(pixel.dot).toBe(`block h-2 w-2 rounded-[1px] ${toneMap.cyan.fill}`);
    const linear = radioIndicatorClasses('linear', { tone: 'cyan', checked: true, disabled: false });
    expect(linear.indicator).toContain('rounded-full');
    expect(linear.dot).toBe(`block h-2 w-2 rounded-full ${toneMap.cyan.fill}`);
  });

  it('fills the checked indicator with its tone and lets unchecked ones react to hover unless disabled', () => {
    expect(radioIndicatorClasses('pixel', { tone: 'gold', checked: true, disabled: false }).indicator).toContain(
      `${toneMap.gold.border} ${toneMap.gold.bg}`,
    );
    expect(radioIndicatorClasses('pixel', { tone: 'gold', checked: false, disabled: false }).indicator).toContain(
      'border-retro-border-strong bg-retro-bg group-hover:border-retro-muted',
    );
    expect(radioIndicatorClasses('pixel', { tone: 'gold', checked: false, disabled: true }).indicator).not.toContain(
      'group-hover',
    );
  });
});
