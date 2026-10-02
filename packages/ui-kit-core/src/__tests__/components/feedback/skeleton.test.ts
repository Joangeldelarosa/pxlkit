import { describe, expect, it } from 'vitest';
import { SKELETON_DEFAULT_HEIGHT, SKELETON_DEFAULT_LABEL, skeletonClasses } from '../../../index';

describe('skeleton recipes', () => {
  it('pulses with the surface radius', () => {
    expect(skeletonClasses('pixel', { rounded: false })).toBe('animate-pulse bg-retro-surface/80 pxl-corner-sm');
    expect(skeletonClasses('linear', { rounded: false })).toBe('animate-pulse bg-retro-surface/80 rounded-md');
  });

  it('rounds into a circle on the linear surface and a 2px chamfer on the pixel one', () => {
    expect(skeletonClasses('linear', { rounded: true })).toBe('animate-pulse bg-retro-surface/80 rounded-full');
    expect(skeletonClasses('pixel', { rounded: true })).toBe('animate-pulse bg-retro-surface/80 rounded-[2px]');
  });

  it('defaults to a 1rem block named "Loading"', () => {
    expect(SKELETON_DEFAULT_HEIGHT).toBe('1rem');
    expect(SKELETON_DEFAULT_LABEL).toBe('Loading');
  });
});
